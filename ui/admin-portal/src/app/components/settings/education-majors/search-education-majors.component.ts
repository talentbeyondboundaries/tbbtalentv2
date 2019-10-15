import {Component, OnInit} from '@angular/core';


import {SearchResults} from '../../../model/search-results';

import {FormBuilder, FormGroup} from "@angular/forms";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {EducationMajor} from "../../../model/education-major";
import {EducationMajorService} from "../../../services/education-major.service";
import {CreateEducationMajorComponent} from "./create/create-education-major.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {EditEducationMajorComponent} from "./edit/edit-education-major.component";
import {ConfirmationComponent} from "../../util/confirm/confirmation.component";

@Component({
  selector: 'app-search-education-majors',
  templateUrl: './search-education-majors.component.html',
  styleUrls: ['./search-education-majors.component.scss']
})
export class SearchEducationMajorsComponent implements OnInit {

  searchForm: FormGroup;
  loading: boolean;
  error: any;
  pageNumber: number;
  pageSize: number;
  results: SearchResults<EducationMajor>;


  constructor(private fb: FormBuilder,
              private educationMajorService: EducationMajorService,
              private modalService: NgbModal) {
  }

  ngOnInit() {

    /* SET UP FORM */
    this.searchForm = this.fb.group({
      keyword: [''],
      status: ['active'],
    });
    this.pageNumber = 1;
    this.pageSize = 50;

    this.onChanges();
  }

  onChanges(): void {
    /* SEARCH ON CHANGE*/
    this.searchForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(res => {
        this.search();
      });
    this.search();
  }

  /* SEARCH FORM */
  search() {
    this.loading = true;
    let request = this.searchForm.value;
    request.pageNumber = this.pageNumber - 1;
    request.pageSize = this.pageSize;
    this.educationMajorService.search(request).subscribe(results => {
      this.results = results;
      this.loading = false;
    });
  }

  addEducationMajor() {
    const addEducationMajorModal = this.modalService.open(CreateEducationMajorComponent, {
      centered: true,
      backdrop: 'static'
    });

    addEducationMajorModal.result
      .then((educationMajor) => this.search())
      .catch(() => { /* Isn't possible */ });
  }

  editEducationMajor(educationMajor) {
    const editEducationMajorModal = this.modalService.open(EditEducationMajorComponent, {
      centered: true,
      backdrop: 'static'
    });

    editEducationMajorModal.componentInstance.educationMajorId = educationMajor.id;

    editEducationMajorModal.result
      .then((educationMajor) => this.search())
      .catch(() => { /* Isn't possible */ });
  }

  deleteEducationMajor(educationMajor) {
    const deleteEducationMajorModal = this.modalService.open(ConfirmationComponent, {
      centered: true,
      backdrop: 'static'
    });

    deleteEducationMajorModal.componentInstance.message = 'Are you sure you want to delete '+educationMajor.name;

    deleteEducationMajorModal.result
      .then((result) => {
        console.log(result);
        if (result === true) {
          this.educationMajorService.delete(educationMajor.id).subscribe(
            (educationMajor) => {
              this.loading = false;
              this.search();
            },
            (error) => {
              this.error = error;
              this.loading = false;
            });
          this.search()
        }
      })
      .catch(() => { /* Isn't possible */ });

  }
}