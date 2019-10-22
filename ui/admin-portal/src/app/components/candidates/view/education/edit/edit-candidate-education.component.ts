import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {CandidateEducationService} from "../../../../../services/candidate-education.service";
import {CandidateEducation} from "../../../../../model/candidate-education";
import {CountryService} from "../../../../../services/country.service";
import {EducationMajorService} from "../../../../../services/education-major.service";

@Component({
  selector: 'app-edit-candidate-education',
  templateUrl: './edit-candidate-education.component.html',
  styleUrls: ['./edit-candidate-education.component.scss']
})
export class EditCandidateEducationComponent implements OnInit {

  candidateEducation: CandidateEducation;

  candidateForm: FormGroup;

  countries = [];
  majors = [];
  years = [];
  error;
  loading: boolean;
  saving: boolean;

  constructor(private activeModal: NgbActiveModal,
              private fb: FormBuilder,
              private candidateEducationService: CandidateEducationService,
              private countryService: CountryService,
              private educationMajorService: EducationMajorService) {
  }

  ngOnInit() {
    this.loading = true;

    /*load the countries */
    this.countryService.listCountries().subscribe(
      (response) => {
        this.countries = response;
      },
      (error) => {
        this.error = error;
        this.loading = false;
      }
    );

    /*load the countries */
    this.educationMajorService.listMajors().subscribe(
      (response) => {
        this.majors = response;
      },
      (error) => {
        this.error = error;
        this.loading = false;
      }
    );

    this.years = [];
    let currentYear = new Date().getFullYear()+4;
    let year = 1950;
    while (year < currentYear){
      this.years.push(year++);
    }

    this.candidateForm = this.fb.group({
      courseName: [this.candidateEducation.courseName],
      institution: [this.candidateEducation.institution],
      countryId: [this.candidateEducation.country ? this.candidateEducation.country.id : null, Validators.required],
      majorId: [this.candidateEducation.educationMajor ? this.candidateEducation.educationMajor.id : null, Validators.required],
      yearCompleted: [this.candidateEducation.yearCompleted],
      educationType: [this.candidateEducation.educationType, [Validators.required]]

    });
    this.loading = false;
  }

  onSave() {
    this.saving = true;
    this.candidateEducationService.update(this.candidateEducation.id, this.candidateForm.value).subscribe(
      (candidateEducation) => {
        this.closeModal(candidateEducation);
        this.saving = false;
      },
      (error) => {
        this.error = error;
        this.saving = false;
      });
  }

  closeModal(candidateEducation: CandidateEducation) {
    this.activeModal.close(candidateEducation);
  }

  dismiss() {
    this.activeModal.dismiss(false);
  }
}