import {Component, OnInit} from '@angular/core';
import {SearchResults} from '../../../../model/search-results';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {LanguageService} from "../../../../services/language.service";
import {CountryService} from "../../../../services/country.service";
import {TranslationService} from "../../../../services/translation.service";
import {TranslationItem} from '../../../../model/translation-item';
import {SystemLanguage} from '../../../../model/language';

@Component({
  selector: 'app-dropdown-translations',
  templateUrl: './dropdown-translations.component.html',
  styleUrls: ['./dropdown-translations.component.scss']
})
export class DropdownTranslationsComponent implements OnInit {

  searchForm: FormGroup;
  loading: boolean;
  error: any;
  pageNumber: number;
  pageSize: number;
  results: SearchResults<TranslationItem>;
  systemLanguages: SystemLanguage[];
  types: SearchResults<any>;

  topLevelForm: FormGroup;


  constructor(private fb: FormBuilder,
              private modalService: NgbModal,
              private languageService: LanguageService,
              private countryService: CountryService,
              private translationService: TranslationService) {
  }

  ngOnInit() {

    /* SET UP FORM */
    this.searchForm = this.fb.group({
      keyword: [''],
      type: ['', Validators.required],
      language: ['', Validators.required],
    });
    this.pageNumber = 1;
    this.pageSize = 50;

    this.getSystemLanguages();
    this.onChanges();

    this.topLevelForm = this.fb.group({
      translations: this.fb.array([])
    });
  }

  getSystemLanguages() {
    this.loading = true;
    this.languageService.listSystemLanguages().subscribe(
      (response) => {
        this.systemLanguages = response.filter(sl => sl.language !== 'en');
        this.loading = false;
      },
      (error) => {
        console.error(error);
      });
  }

  onChanges(): void {
    /* SEARCH ON CHANGE*/
    this.searchForm.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(res => {
        //reset page number as changing types
        this.pageNumber = 1;
        this.search();
      });
    this.search();
  }

  /* SEARCH FORM */
  search() {
    let request = this.searchForm.value;
    request.pageNumber = this.pageNumber - 1;
    request.pageSize = this.pageSize;

    if (this.searchForm.valid) {
      let type = this.searchForm.controls['type'].value;
      let language = this.searchForm.controls['language'].value;
      this.loading = true;
      this.results = null;
      this.error = null;
      this.translationService.search(request.type, request).subscribe(results => {
          this.results = results;

          //form for editing
          this.topLevelForm = this.fb.group({
            translations: this.fb.array(
              this.results.content.map(t => this.fb.group({
                id: [t.id, [Validators.required]],
                type: [type, [Validators.required]],
                language: [language, [Validators.required]],
                translatedId: [t.translatedId, [Validators.required]],
                translatedName: [t.translatedName, [Validators.required, Validators.minLength(2)]]
              }))
            )
          });
          this.loading = false;
        },
        (error) => {
          this.error = error;
          this.loading = false;
        });

    }


  }

  updateTranslation(index) {
    let translationForm = this.topLevelForm.get(`translations.${index}`) as FormGroup;
    let request = translationForm.value;
    if (request.translatedId) {
      //update
      this.translationService.update(request.translatedId, request).subscribe(results => {
        this.search();
      })
    } else {
      // create
      this.translationService.create(request).subscribe(results => {
          this.search();
        }
      );
    }


  }


}