import {Component, EventEmitter, HostListener, OnInit, Output} from '@angular/core';
import {S3HelperService} from "../../../services/s3-helper.service";
import {S3UploadParams} from "../../../model/s3-upload-params";

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {

  @HostListener('dragover', ['$event'])
  public onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.hover = true;
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.hover = false;
  }

  @HostListener('drop', ['$event'])
  public onDrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.hover = false;
    if (!this.uploading) {
      const fileChangeEvent = {target: {files: evt.dataTransfer.files}};
      this.handleFileChanged(fileChangeEvent);
    }
  }

  @Output() fileUploaded = new EventEmitter<any>();

  error: any;
  loading: boolean;
  uploading: boolean;
  hover: boolean;
  files: File[];

  s3Params: S3UploadParams;

  constructor(private s3HelperService: S3HelperService) { }

  ngOnInit() {
    this.loading = true;
    const folder = (new Date()).getTime().toString();
    this.s3HelperService.getUploadPolicy(folder).subscribe(
      (response) => {
        this.s3Params = response;
        this.s3Params.objectKey = folder;
        this.loading = false;
      },
      (error) => {
        this.error = error;
        this.loading = false;
      });
  }

  handleFileChanged(event: any) {
    if (this.uploading) {
      return;
    }
    this.files = [...event.target.files];

    if (!!this.files && this.files.length) {
      this.uploading = true;
      this.uploadFilesToS3();
    }
  }

  uploadFilesToS3() {
    this.error = null;

    /* Extract the first element from the file array */
    const file = this.files.splice(0, 1)[0];

    /* Validate the file */
    if (!this.validFile(file)) {
      this.uploading = false;
      return;
    }

    /* Upload file */
    this.s3HelperService.uploadFileToTempFolder(this.s3Params, file)
      .then(() => {
        this.fileUploaded.emit({
          s3Params: this.s3Params,
          file: file
        });

        // Are there more files to upload?
        if (this.files.length) {
          this.uploadFilesToS3(); // Call recursively
        } else {
          this.uploading = false;
        }
      })
      .catch((error) => {
        this.error = error;
        this.uploading = false;
      });
  }

  validFile(file) {
    if (file.name.indexOf('.') === -1) {
      this.error = 'No file extension found. Please rename and re-upload this file.';
      return false;
    }

    const tokens = file.name.split('.');
    const validExtensions = [
      'jpg',
      'png',
      'pdf',
      'doc',
      'docx',
      'txt',
    ];
    const ext = tokens[tokens.length - 1].toLowerCase();
    if (!validExtensions.includes(ext)) {
      this.error = 'Unsupported file extension. Please upload a file with one of the following extensions: ' + validExtensions.join(', ');
      return false;
    }

    return true;
  }
}