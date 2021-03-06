/*
 * Copyright (c) 2021 Talent Beyond Boundaries.
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License
 * for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/.
 */

import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {CandidateJobExperienceService} from "../../../../../../services/candidate-job-experience.service";
import {CandidateJobExperience} from "../../../../../../model/candidate-job-experience";
import {CountryService} from "../../../../../../services/country.service";
import {Candidate} from "../../../../../../model/candidate";

@Component({
  selector: 'app-edit-candidate-job-experience',
  templateUrl: './edit-candidate-job-experience.component.html',
  styleUrls: ['./edit-candidate-job-experience.component.scss']
})
export class EditCandidateJobExperienceComponent implements OnInit {

  candidateJobExperience: CandidateJobExperience;
  candidate: Candidate;

  candidateForm: FormGroup;

  countries = [];
  years = [];
  error;
  loading: boolean;
  saving: boolean;

  constructor(private activeModal: NgbActiveModal,
              private fb: FormBuilder,
              private candidateJobExperienceService: CandidateJobExperienceService,
              private countryService: CountryService ) {
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

    this.candidateForm = this.fb.group({
      countryId: [this.candidateJobExperience.country ? this.candidateJobExperience.country.id : null, Validators.required],
      companyName: [this.candidateJobExperience.companyName, Validators.required],
      role: [this.candidateJobExperience.role, Validators.required],
      startDate: [this.candidateJobExperience.startDate, Validators.required],
      endDate: [this.candidateJobExperience.endDate],
      fullTime: [this.candidateJobExperience.fullTime, Validators.required],
      paid: [this.candidateJobExperience.paid, Validators.required],
      description: [this.candidateJobExperience.description, Validators.required],
    });
    this.loading = false;
  }

  onSave() {
    this.saving = true;
    this.candidateJobExperienceService.update(this.candidateJobExperience.id, this.candidateForm.value).subscribe(
      (candidateJobExperience) => {
        this.closeModal(candidateJobExperience);
        this.saving = false;
      },
      (error) => {
        this.error = error;
        this.saving = false;
      });
  }

  closeModal(candidateJobExperience: CandidateJobExperience) {
    this.activeModal.close(candidateJobExperience);
  }

  dismiss() {
    this.activeModal.dismiss(false);
  }
}
