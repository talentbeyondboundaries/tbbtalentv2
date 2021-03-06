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
import {
  CandidateStatService,
  CandidateStatsRequest
} from "../../services/candidate-stat.service";
import {StatReport} from "../../model/stat-report";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {
  SavedList,
  SearchSavedListRequest
} from "../../model/saved-list";
import {SavedListService} from "../../services/saved-list.service";
import {IDropdownSettings} from "ng-multiselect-dropdown";
import {isArray} from "rxjs/internal-compatibility";
import {ActivatedRoute} from "@angular/router";
import {SavedSearch} from "../../model/saved-search";
import {forkJoin} from "rxjs";
import {SavedSearchService} from "../../services/saved-search.service";
import {findHasId} from "../../model/base";

@Component({
  selector: 'app-infographic',
  templateUrl: './infographic.component.html',
  styleUrls: ['./infographic.component.scss']
})
export class InfographicComponent implements OnInit {

  loading: boolean = false;
  dataLoaded: boolean = false;
  error: any;
  lists: SavedList[] = [];
  searches: SavedSearch[] = [];
  statReports: StatReport[];
  statsFilter: FormGroup;

  dropdownSettings: IDropdownSettings = {
    idField: 'id',
    textField: 'name',
    enableCheckAll: false,
    singleSelection: true,
    allowSearchFilter: true
  };

  constructor(private route: ActivatedRoute,
              private statService: CandidateStatService,
              private savedListService: SavedListService,
              private savedSearchService: SavedSearchService,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    this.dataLoaded = false;

    this.statsFilter = this.fb.group({
      savedList: [null],
      savedSearch: [null],
      dateFrom: ['', [Validators.required]],
      dateTo: ['', [Validators.required]]
    });

    this.loadListsAndSearches();
  }

  get dateFrom(): string { return this.statsFilter.value.dateFrom; }
  get dateTo(): string { return this.statsFilter.value.dateTo; }
  get savedList(): SavedList {
    const savedList: SavedList = this.statsFilter.value.savedList;
    //Control always returns an array
    return (savedList == null || (isArray(savedList) && savedList.length === 0)
    || savedList[0] == null)  ? null : savedList[0];
  }
  get savedSearch(): SavedSearch {
    const savedSearch: SavedSearch = this.statsFilter.value.savedSearch;
    //Control always returns an array
    return (savedSearch == null || (isArray(savedSearch) && savedSearch.length === 0)
      || savedSearch[0] == null)  ? null : savedSearch[0];
  }

  private loadListsAndSearches() {
    /*load all our visible lists and searches */
    this.loading = true;
    const request: SearchSavedListRequest = {
      owned: true,
      shared: true,
      global: true
    };


    forkJoin( {
      'lists': this.savedListService.search(request),
      'searches': this.savedSearchService.search(request)
    }).subscribe(
      results => {
        this.loading = false;
        this.lists = results['lists'];
        this.searches = results['searches'];

        this.initializeFilterFields();
      },
      (error) => {
        this.error = error;
        this.loading = false;
      }
    );
  }

  /**
   * Initializes the saved list and saved search filters based on any url parameters that were
   * supplied
   */
  private initializeFilterFields() {
    this.route.paramMap.subscribe(params => {
      const id: number = +params.get('id');
      const isSavedSearchId = params.get('source') === 'search';
      if (id) {
        if (isSavedSearchId) {
          this.statsFilter.controls['savedSearch'].patchValue([findHasId(id, this.searches)]);
        } else {
          this.statsFilter.controls['savedList'].patchValue([findHasId(id, this.lists)]);
        }

        //Auto run if we have an id
        this.submitStatsRequest();
      }
    });
  }

  submitStatsRequest(){
    this.loading = true;

    const request: CandidateStatsRequest = {
      listId: this.savedList == null ? null : this.savedList.id,
      searchId: this.savedSearch == null ? null : this.savedSearch.id,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo
    }

    this.statService.getAllStats(request).subscribe(result => {
        this.loading = false;
        this.statReports = result;
        this.dataLoaded = true;
      },
      error => {
        this.error = error;
        this.loading = false;
      }
    )

  }

  exportStats() {
      const options = {type: 'text/csv;charset=utf-8;'};
      const filename = 'stats.csv';

      const csv: string[] = [];

      // Add date filter to export csv
      csv.push('"' + 'Exported Date' + '","' + new Date().toUTCString() + '"\n');
      csv.push('"' + 'Date From' + '","' + this.statsFilter.value.dateFrom + '"\n')
      csv.push('"' + 'Date To' + '","' + this.statsFilter.value.dateTo + '"\n')
      if (this.savedList) {
        csv.push('"' + 'List' + '","' + this.savedList.name + '(' + this.savedList.id + ')"\n')
      }
      if (this.savedSearch) {
        csv.push('"' + 'Search' + '","' + this.savedSearch.name + '(' + this.savedSearch.id + ')"\n')
      }
      csv.push('\n');

      // Add data to export csv
      for (const statReport of this.statReports) {
        csv.push(statReport.name + '\n');
        for (const row of statReport.rows) {
          csv.push('"' + row.label + '","' + row.value.toString() + '"\n')
        }
        csv.push('\n');
      }

    const blob = new Blob(csv, options);

    if (navigator.msSaveBlob) {
      // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      // Browsers that support HTML5 download attribute
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }
}
