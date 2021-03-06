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
import {User} from "../../../../model/user";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {UserService} from "../../../../services/user.service";
import {CountryService} from "../../../../services/country.service";
import {Country} from "../../../../model/country";
import {IDropdownSettings} from "ng-multiselect-dropdown";

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})

export class CreateUserComponent implements OnInit {

  userForm: FormGroup;
  error;
  loading: boolean;
  saving: boolean;

  /* MULTI SELECT */
  dropdownSettings: IDropdownSettings = {
    idField: 'id',
    textField: 'name',
    enableCheckAll: false,
    singleSelection: false,
    allowSearchFilter: true
  };

  countries: Country[];

  constructor(private activeModal: NgbActiveModal,
              private fb: FormBuilder,
              private userService: UserService,
              private countryService: CountryService) {
  }

  ngOnInit() {
    this.userForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      username: [null, Validators.required],
      password: [null, Validators.required],
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      role: [null, Validators.required],
      sourceCountries: [null],
      readOnly: [false]
    });

    this.countryService.listCountries().subscribe(
      (response) => {
        this.countries = response;
      },
      (error) => {
        this.error = error;
        this.loading = false;
      }
    );

  }

  onSave() {
    this.saving = true;
    this.userService.create(this.userForm.value).subscribe(
      (user) => {
        this.closeModal(user);
        this.saving = false;
      },
      (error) => {
        this.error = error;
        this.saving = false;
      });
  }

  closeModal(user: User) {
    this.activeModal.close(user);
  }

  dismiss() {
    this.activeModal.dismiss(false);
  }

  /* MULTI SELECT METHODS */
  onItemSelect(item: any) {
    console.log(this.userForm);
    // const values = this.userForm.controls.sourceCountryIds.value || [];
    // const addValue = item.id != null ? item.id : item;
    // values.push(addValue);
    // this.userForm.controls.sourceCountryIds.patchValue(values);
    // console.log(values)
  }

  onItemDeSelect(item: any) {
    // const values = this.userForm.controls[formControlName].value || [];
    // const removeValue = item.id != null ? item.id : item;
    // const indexToRemove = values.findIndex(val => val === removeValue);
    // if (indexToRemove >= 0) {
    //   values.splice(indexToRemove, 1);
    //   this.userForm.controls[formControlName].patchValue(values);
    // }
  }

}
