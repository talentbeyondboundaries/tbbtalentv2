import {Component, OnInit} from '@angular/core';


import {SearchResults} from '../../../model/search-results';

import {FormBuilder, FormGroup} from "@angular/forms";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {Language} from "../../../model/language";
import {LanguageService} from "../../../services/language.service";
import {CreateLanguageComponent} from "./create/create-language.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {EditLanguageComponent} from "./edit/edit-language.component";
import {ConfirmationComponent} from "../../util/confirm/confirmation.component";

@Component({
  selector: 'app-search-languages',
  templateUrl: './search-languages.component.html',
  styleUrls: ['./search-languages.component.scss']
})
export class SearchLanguagesComponent implements OnInit {

  searchForm: FormGroup;
  loading: boolean;
  error: any;
  pageNumber: number;
  pageSize: number;
  results: SearchResults<Language>;


  constructor(private fb: FormBuilder,
              private languageService: LanguageService,
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
    this.languageService.search(request).subscribe(results => {
      this.results = results;
      this.loading = false;
    });
  }

  addLanguage() {
    const addLanguageModal = this.modalService.open(CreateLanguageComponent, {
      centered: true,
      backdrop: 'static'
    });

    addLanguageModal.result
      .then((language) => this.search())
      .catch(() => { /* Isn't possible */ });
  }

  editLanguage(language) {
    const editLanguageModal = this.modalService.open(EditLanguageComponent, {
      centered: true,
      backdrop: 'static'
    });

    editLanguageModal.componentInstance.languageId = language.id;

    editLanguageModal.result
      .then((language) => this.search())
      .catch(() => { /* Isn't possible */ });
  }

  deleteLanguage(language) {
    const deleteLanguageModal = this.modalService.open(ConfirmationComponent, {
      centered: true,
      backdrop: 'static'
    });

    deleteLanguageModal.componentInstance.message = 'Are you sure you want to delete '+language.name;

    deleteLanguageModal.result
      .then((result) => {
        console.log(result);
        if (result === true) {
          this.languageService.delete(language.id).subscribe(
            (language) => {
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