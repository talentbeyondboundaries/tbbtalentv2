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

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {CandidateService} from "../../../services/candidate.service";
import {AuthService} from "../../../services/auth.service";
import {Candidate, RegisterCandidateRequest} from "../../../model/candidate";
import {RegistrationService} from "../../../services/registration.service";
import {ReCaptchaV3Service} from "ng-recaptcha";

@Component({
  selector: 'app-registration-contact',
  templateUrl: './registration-contact.component.html',
  styleUrls: ['./registration-contact.component.scss']
})
export class RegistrationContactComponent implements OnInit {

  /* A flag to indicate if the component is being used on the profile component */
  @Input() edit: boolean = false;

  @Output() onSave = new EventEmitter();

  form: FormGroup;
  error: any;
  // Form states
  loading: boolean;
  saving: boolean;
  // Candidate data
  authenticated: boolean;
  candidate: Candidate;

  constructor(private fb: FormBuilder,
              private router: Router,
              private candidateService: CandidateService,
              private authService: AuthService,
              private reCaptchaV3Service: ReCaptchaV3Service,
              private registrationService: RegistrationService) { }

  ngOnInit() {
    this.authenticated = false;
    this.loading = true;
    this.candidate = null;
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      whatsapp: [''],
      // username: ['']
    });

    if (this.authService.isAuthenticated()) {
      this.authenticated = true;
      this.candidateService.getCandidateContact().subscribe(
        (candidate) => {
          this.candidate = candidate;
          this.form.patchValue({
            email: candidate.user ? candidate.user.email : '',
            phone: candidate.phone,
            whatsapp: candidate.whatsapp,
            // username: candidate.user ? response.user.username : ''
          });
          this.loading = false;
        },
        (error) => {
          this.error = error;
          this.loading = false;
        }
      );
    } else {
      // The user has not registered - add the password fields to the reactive form
      this.form.addControl('password', new FormControl('', [Validators.required, Validators.minLength(8)]));
      this.form.addControl('passwordConfirmation', new FormControl('', [Validators.required, Validators.minLength(8)]));
      this.loading = false;
    }
  }

  get email(): string {
    return this.form.value.email;
  }

  get password(): string {
    return this.form.value.password;
  }

  get passwordConfirmation(): string {
    return this.form.value.passwordConfirmation;
  }

  get phone(): string {
    return this.form.value.phone;
  }

  get whatsapp(): string {
    return this.form.value.whatsapp;
  }

  cancel() {
    this.onSave.emit();
  }

  save() {
    this.saving = true;
    this.error = null;
    if (this.authService.isAuthenticated()) {

      // If the candidate hasn't changed anything, skip the update service call
      if (this.form.pristine) {
        this.registrationService.next();
        this.onSave.emit();
        return;
      }

      // The user has already registered and is revisiting this page
      this.candidateService.updateCandidateContact(this.form.value).subscribe(
        (response) => {
          this.registrationService.next();
          this.onSave.emit();
        },
        (error) => {
          // console.log(error);
          this.error = error;
          this.saving = false;
        }
      );
    } else {
      // The user has not yet registered - create an account for them
      const action = 'registration';
      this.reCaptchaV3Service.execute(action).subscribe(
        (token) => this.registerWithToken(token),
        (error) => {
          console.log(error);
        }
      );
    }
  }

  private registerWithToken(token: string) {
    const req: RegisterCandidateRequest = new RegisterCandidateRequest();
    req.email = this.email;
    req.phone = this.phone;
    req.whatsapp = this.whatsapp;
    req.password = this.password;
    req.passwordConfirmation = this.passwordConfirmation;
    req.reCaptchaV3Token = token;

    this.authService.register(req).subscribe(
      (response) => {
        this.registrationService.next();
      },
      (error) => {
        // console.log(error);
        this.error = error;
        this.saving = false;
      }
    );
  }
}
