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
import {NgbTabChangeEvent} from "@ng-bootstrap/ng-bootstrap";
import {SavedSearchSubtype, SavedSearchType} from "../../model/saved-search";
import {CandidateSourceType, SearchBy} from "../../model/base"
import {LocalStorageService} from "angular-2-local-storage";
import {
  SavedSearchService,
  SavedSearchTypeInfo,
  SavedSearchTypeSubInfo
} from "../../services/saved-search.service";
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  activeTabId: string;
  categoryForm: FormGroup;
  private lastTabKey: string = 'HomeLastTab';
  private lastCategoryTabKey: string = 'HomeLastCategoryTab';
  savedSearchTypeInfos: SavedSearchTypeInfo[];
  savedSearchTypeSubInfos: SavedSearchTypeSubInfo[];
  selectedSavedSearchSubtype: SavedSearchSubtype;

  constructor(
    private fb: FormBuilder,
    private localStorageService: LocalStorageService,
    private savedSearchService: SavedSearchService
  ) {
    this.savedSearchTypeInfos = savedSearchService.getSavedSearchTypeInfos();
  }

  ngOnInit() {

    this.categoryForm = this.fb.group({
      savedSearchSubtype: [this.selectedSavedSearchSubtype]
    });

    this.selectDefaultTab()
  }

  onTabChanged(event: NgbTabChangeEvent) {
    this.setActiveTabId(event.nextId);
  }

  onSavedSearchSubtypeChange($event: Event) {
    const formValues = this.categoryForm.value;
    this.setSelectedSavedSearchSubtype(formValues.savedSearchSubtype);
  }

  private selectDefaultTab() {
    const defaultActiveTabID: string = this.localStorageService.get(this.lastTabKey);
    this.setActiveTabId(defaultActiveTabID == null ? "type:profession" : defaultActiveTabID);

    if (defaultActiveTabID == null) {
      this.setSelectedSavedSearchSubtype(this.savedSearchTypeSubInfos[0].savedSearchSubtype);
    } else {
      const defaultCategory: string = this.localStorageService.get(this.lastCategoryTabKey);
      this.setSelectedSavedSearchSubtype(defaultCategory == null ? 0 : +defaultCategory);
    }
  }

  private setActiveTabId(id: string) {

    this.activeTabId = id;

    const parts = id.split(':');
    if (parts[0] === 'type' && parts.length === 2) {

      const type: SavedSearchType = SavedSearchType[parts[1]];
      this.savedSearchTypeSubInfos = this.savedSearchTypeInfos[type].categories;

    }

    this.localStorageService.set(this.lastTabKey, id);
  }

  private setSelectedSavedSearchSubtype(selectedSavedSearchSubtype: number) {
    this.selectedSavedSearchSubtype = selectedSavedSearchSubtype;
    this.categoryForm.controls['savedSearchSubtype'].patchValue(selectedSavedSearchSubtype);

    this.localStorageService.set(this.lastCategoryTabKey, this.selectedSavedSearchSubtype);
  }

  //Make some Enum types visible in HTML

  get CandidateSourceType() {
    return CandidateSourceType;
  }

  get SearchBy() {
    return SearchBy;
  }

  get SavedSearchType() {
    return SavedSearchType;
  }
}
