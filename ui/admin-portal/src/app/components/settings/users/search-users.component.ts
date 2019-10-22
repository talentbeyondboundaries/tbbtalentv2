import { Component, OnInit } from '@angular/core';


import { SearchResults } from '../../../model/search-results';

import {FormBuilder, FormGroup} from "@angular/forms";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {User} from "../../../model/user";
import {UserService} from "../../../services/user.service";
import {CreateUserComponent} from "./create/create-user.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {EditUserComponent} from "./edit/edit-user.component";
import {ConfirmationComponent} from "../../util/confirm/confirmation.component";

@Component({
  selector: 'app-search-users',
  templateUrl: './search-users.component.html',
  styleUrls: ['./search-users.component.scss']
})
export class SearchUsersComponent implements OnInit {

  searchForm: FormGroup;
  loading: boolean;
  error: any;
  pageNumber: number;
  pageSize: number;
  results: SearchResults<User>;

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private modalService: NgbModal) { }

  ngOnInit() {

  /* SET UP FORM */
    this.searchForm = this.fb.group({
      keyword: [''],
      role: ['admin'],
      status: ['active']
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
    request.pageSize =  this.pageSize;
    this.userService.search(request).subscribe(results => {
      this.results = results;
      this.loading = false;
    });
  }

  addUser() {
    const addUserModal = this.modalService.open(CreateUserComponent, {
      centered: true,
      backdrop: 'static'
    });

    addUserModal.result
      .then((user) => this.search())
      .catch(() => { /* Isn't possible */ });
  }

  editUser(user) {
    const editUserModal = this.modalService.open(EditUserComponent, {
      centered: true,
      backdrop: 'static'
    });

    editUserModal.componentInstance.userId = user.id;

    editUserModal.result
      .then((user) => this.search())
      .catch(() => { /* Isn't possible */ });
  }

  deleteUser(user) {
    const deleteUserModal = this.modalService.open(ConfirmationComponent, {
      centered: true,
      backdrop: 'static'
    });

    deleteUserModal.componentInstance.message = 'Are you sure you want to delete '+user.username;

    deleteUserModal.result
      .then((result) => {
        if (result === true) {
          this.userService.delete(user.id).subscribe(
            (user) => {
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