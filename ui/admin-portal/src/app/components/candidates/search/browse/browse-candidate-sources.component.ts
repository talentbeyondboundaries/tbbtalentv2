import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {SearchResults} from '../../../../model/search-results';
import {FormBuilder, FormGroup} from '@angular/forms';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {
  indexOfAuditable,
  isSavedSearch,
  SavedSearchSubtype,
  SavedSearchType,
  SearchSavedSearchRequest
} from '../../../../model/saved-search';
import {SavedSearchService} from '../../../../services/saved-search.service';
import {Router} from '@angular/router';
import {LocalStorageService} from "angular-2-local-storage";
import {AuthService} from "../../../../services/auth.service";
import {User} from "../../../../model/user";
import {
  CandidateSource,
  CandidateSourceType,
  isSharedWithMe,
  SearchBy,
  SearchCandidateSourcesRequest
} from "../../../../model/base";
import {SearchSavedListRequest} from "../../../../model/saved-list";
import {CandidateSourceService} from "../../../../services/candidate-source.service";
import {UpdateSearchComponent} from "../../../search/update/update-search.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {UpdateListComponent} from "../../../list/update/update-list.component";

@Component({
  selector: 'app-browse-candidate-sources',
  templateUrl: './browse-candidate-sources.component.html',
  styleUrls: ['./browse-candidate-sources.component.scss']
})
export class BrowseCandidateSourcesComponent implements OnInit, OnChanges {

  private savedStateKeyPrefix: string = 'BrowseKey';

  @Input() sourceType: CandidateSourceType;
  @Input() searchBy: SearchBy;
  @Input() savedSearchType: SavedSearchType;
  @Input() savedSearchSubtype: SavedSearchSubtype;
  searchForm: FormGroup;
  public loading: boolean;
  error: any;
  pageNumber: number;
  pageSize: number;
  results: SearchResults<CandidateSource>;
  selectedSource: CandidateSource;
  selectedIndex = 0;
  private loggedInUser: User;

  constructor(private fb: FormBuilder,
              private localStorageService: LocalStorageService,
              private router: Router,
              private authService: AuthService,
              private modalService: NgbModal,
              private candidateSourceService: CandidateSourceService,
              private savedSearchService: SavedSearchService) {
  }

  ngOnInit() {

    this.loggedInUser = this.authService.getLoggedInUser();

    this.searchForm = this.fb.group({
      keyword: ['']
    });
    this.pageNumber = 1;
    this.pageSize = 50;

    this.onChanges();
  }

  get keyword(): string {
    return this.searchForm ? this.searchForm.value.keyword : "";
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.search();
  }

  onChanges(): void {
    this.searchForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.search();
      });
    this.search();
  }

  search() {
    let req: SearchCandidateSourcesRequest;
    if (this.sourceType === CandidateSourceType.SavedSearch) {
      req = new SearchSavedSearchRequest();
    } else {
      req = new SearchSavedListRequest();
    }
    req.keyword = this.keyword;
    req.pageNumber = this.pageNumber - 1;
    req.pageSize = this.pageSize;
    req.sortFields = ['name'];
    req.sortDirection = 'ASC';
    req.pageNumber = this.pageNumber - 1;
    req.pageSize = this.pageSize;
    req.sortFields = ['name'];
    req.sortDirection = 'ASC';
    switch (this.searchBy) {
      case SearchBy.mine:
        req.owned = true;
        break;
      case SearchBy.sharedWithMe:
        req.shared = true;
        break;
      case SearchBy.all:
        req.fixed = true;
        req.owned = true;
        req.shared = true;
        break;
    }
    if (this.savedSearchType !== undefined) {
      if (req instanceof SearchSavedSearchRequest) {
        req.savedSearchType = this.savedSearchType;
        req.savedSearchSubtype = this.savedSearchSubtype;
        req.fixed = true;
        req.owned = true;
        req.shared = true;
      }
    }

    this.loading = true;

    this.candidateSourceService.searchPaged(req).subscribe(results => {
      this.results = results;

      if (results.content.length > 0) {
        //Selected previously search if any
        const id: number = this.localStorageService.get(this.savedStateKey());
        if (id) {
          this.selectedIndex = indexOfAuditable(id, this.results.content);
          if (this.selectedIndex >= 0) {
            this.selectedSource = this.results.content[this.selectedIndex];
          } else {
            //Select the first search if can't find previous (category of search
            // may have changed)
            this.onSelect(this.results.content[0]);
          }
        } else {
          //Select the first search if no previous
          this.onSelect(this.results.content[0]);
        }
      }

      this.loading = false;
    },
    error => {
      this.error = error;
      this.loading = false;
    });
  }

  onSelect(source: CandidateSource) {
    this.selectedSource = source;

    const id: number = source.id;
    this.localStorageService.set(this.savedStateKey(), id);

    this.selectedIndex = indexOfAuditable(id, this.results.content);
  }

  private savedStateKey() {
    //We save the last state of each combination of inputs - ie the last
    //selected item.
    //(These inputs are associated with each tab in home.component.html)

    //The standard key is "Browse" + the sourceType + the search type
    let key = this.savedStateKeyPrefix
      + CandidateSourceType[this.sourceType]
      + SearchBy[this.searchBy];

    //If searching by type, also need the saved search type
    if (this.searchBy === SearchBy.type && this.savedSearchType !== undefined) {
      key += this.savedSearchType +
        (this.savedSearchSubtype !== undefined ? '/' + this.savedSearchSubtype : "");
    }
    return key;
  }

  keyDown(event: KeyboardEvent) {
    const oldSelectedIndex = this.selectedIndex;
    switch (event.key) {
      case 'ArrowUp':
        if (this.selectedIndex > 0) {
          this.selectedIndex--;
        }
        break;
      case 'ArrowDown':
        if (this.selectedIndex < this.results.content.length - 1) {
          this.selectedIndex++;
        }
        break;
    }
    if (this.selectedIndex !== oldSelectedIndex) {
      this.onSelect(this.results.content[this.selectedIndex])
    }
  }

  onDeleteSource(source: CandidateSource) {
    //If shared just remove from my shares, otherwise delete
    this.loading = true;
    if (isSharedWithMe(source, this.authService)) {
      //Remove from sharing
      const loggedInUser = this.authService.getLoggedInUser();

      this.candidateSourceService.removeSharedUser(
        source, {userId: loggedInUser.id}).subscribe(
        () => {
          //Refresh display which will remove source if displayed.
          this.search();
          this.loading = false;
        },
        error => {
          this.error = error;
          this.loading = false;
        }
      )
    } else {
      this.candidateSourceService.delete(source).subscribe(
          () => {
            //Refresh display which will remove source if displayed.
            this.search();
            this.loading = false;
          },
          (error) => {
            this.error = error;
            this.loading = false;
          });
    }
  }

  onEditSource(source: CandidateSource) {
    if (isSavedSearch(source)) {
      const editModal = this.modalService.open(UpdateSearchComponent);

      editModal.componentInstance.savedSearch = source;

      editModal.result
        .then(() => {
          //Refresh display
          this.search();
        })
        .catch(() => { /* Isn't possible */
        });
    } else {
      const editModal = this.modalService.open(UpdateListComponent);

      editModal.componentInstance.savedList = source;

      editModal.result
        .then(() => {
          //Refresh display
          this.search();
        })
        .catch(() => { /* Isn't possible */
        });
    }

  }

  onToggleWatch(source: CandidateSource) {
    //Currently only watch save searches
    if (isSavedSearch(source)) {
      this.loading = true;
      if (this.isWatching(source)) {
        this.savedSearchService
          .removeWatcher(source.id, {userId: this.loggedInUser.id})
          .subscribe(result => {
            //Update local copy
            this.updateLocalCandidateSourceCopy(result);
            this.loading = false;
          }, err => {
            this.loading = false;
            this.error = err;
          })
      } else {
        this.savedSearchService
          .addWatcher(source.id, {userId: this.loggedInUser.id})
          .subscribe(result => {
            this.updateLocalCandidateSourceCopy(result);
            this.loading = false;
          }, err => {
            this.loading = false;
            this.error = err;
          })
      }
    }
  }

  private isWatching(source: CandidateSource): boolean {
    return source.watcherUserIds.indexOf(this.loggedInUser.id) >= 0;
  }

  private updateLocalCandidateSourceCopy(source: CandidateSource) {
    const index: number = indexOfAuditable(source.id, this.results.content);
    if (index >= 0) {
      this.results.content[index] = source;
    }
    if (this.selectedIndex === index) {
      this.selectedSource = source;
    }
  }
}