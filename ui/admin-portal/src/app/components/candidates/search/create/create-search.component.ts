import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {SavedSearchService} from "../../../../services/saved-search.service";
import {
  convertToSavedSearchRequest,
  SavedSearch
} from "../../../../model/saved-search";
import {SearchCandidateRequest} from "../../../../model/search-candidate-request";

@Component({
  selector: 'app-create-search',
  templateUrl: './create-search.component.html',
  styleUrls: ['./create-search.component.scss']
})

export class CreateSearchComponent implements OnInit {

  form: FormGroup;
  error;
  saving: boolean;
  savedSearch: SavedSearch;
  searchCandidateRequest: SearchCandidateRequest;
  update;

  constructor(private activeModal: NgbActiveModal,
              private fb: FormBuilder,
              private savedSearchService: SavedSearchService) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      name: [null, Validators.required],
      type: [null, Validators.required],
    });
    if (this.savedSearch) {
      //Copy the form values in so that they can be displayed in any summary
      //(Otherwise we just see the unmodified search values)
      this.savedSearch = Object.assign(this.savedSearch, this.searchCandidateRequest);
    }
  }

  save() {
    this.saving = true;

    //Update the saved search with the name and value from the form.
    const formValues = this.form.value;
    this.savedSearch = {
      id: 0,
      name: formValues.name,
      type: formValues.type
    };

    //And create a SavedSearchRequest from the SavedSearch and the search request
    this.savedSearchService.create(
      convertToSavedSearchRequest(this.savedSearch, this.searchCandidateRequest)
    ).subscribe(
      (savedSearch) => {
        this.closeModal(savedSearch);
        this.saving = false;
      },
      (error) => {
        this.error = error;
        this.saving = false;
      });
  }


  closeModal(savedSearch: SavedSearch) {
    this.activeModal.close(savedSearch);
  }

  dismiss() {
    this.activeModal.dismiss(false);
  }
}
