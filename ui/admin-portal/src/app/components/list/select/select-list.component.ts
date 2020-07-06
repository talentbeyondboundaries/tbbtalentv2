import {Component, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormGroup} from "@angular/forms";
import {SavedList, SearchSavedListRequest} from "../../../model/saved-list";
import {IDropdownSettings} from "ng-multiselect-dropdown";
import {SavedListService} from "../../../services/saved-list.service";


export interface TargetListSelection {
  //List id - 0 if new list requested
  savedListId: number;

  //Name of new list to be created (if any - only used if savedListId = 0)
  newListName?: string;

  //If true any existing contents of target list should be replaced, otherwise
  //contents are added (merged).
  replace: boolean;
}


@Component({
  selector: 'app-select-list',
  templateUrl: './select-list.component.html',
  styleUrls: ['./select-list.component.scss']
})
export class SelectListComponent implements OnInit {

  error: string;
  form: FormGroup;
  loading: boolean;
  saving: boolean;
  action: string = "Save";
  title: string = "Select List";

  lists: SavedList[] = [];

  dropdownSettings: IDropdownSettings = {
    idField: 'id',
    textField: 'name',
    enableCheckAll: false,
    singleSelection: true,
    allowSearchFilter: true
  };

  constructor(
    private savedListService: SavedListService,
    private activeModal: NgbActiveModal,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.form = this.fb.group({
      newListName: [null],
      newList: [false],
      savedList: [null],
      replace: [false],
    });
    this.loadLists();
  }

  get newListName(): string { return this.form.value.newListName; }
  get newList(): boolean { return this.form.value.newList; }
  get replace(): boolean { return this.form.value.replace; }
  get savedList(): SavedList { return this.form.value.savedList; }

  private loadLists() {
    /*load all our non fixed lists */
    this.loading = true;
    const request: SearchSavedListRequest = {
      owned: true,
      shared: true,
      fixed: false
    };

    this.savedListService.search(request).subscribe(
      (results) => {
        this.lists = results;
        this.loading = false;
      },
      (error) => {
        this.error = error;
        this.loading = false;
      }
    );
  }

  dismiss() {
    this.activeModal.dismiss(false);
  }

  select() {
    const selection: TargetListSelection = {
      savedListId: this.savedList === null ? 0 : this.savedList[0].id,
      newListName: this.newList ? this.newListName : null,
      replace: this.replace
    }
    this.activeModal.close(selection);
  }
}
