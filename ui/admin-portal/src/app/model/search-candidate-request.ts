import {Language} from './language';
import {SavedSearchJoin} from './saved-search';

export interface SearchCandidateRequest {
  keyword?: string;
  gender?: string;
  statuses?: string;
  occupationIds?: number[];
  orProfileKeyword?: string;
  verifiedOccupationIds?: number[];
  verifiedOccupationSearchType?: string;
  nationalityIds?: number[];
  nationalitySearchType?: string;
  countryIds?: number[];
  englishMinWrittenLevel?: number;
  englishMinSpokenLevel?: number;
  otherLanguage?: Language;
  otherMinWrittenLevel?: number;
  otherMinSpokenLevel?: number;
  lastModifiedFrom?: string;
  lastModifiedTo?: string;
  createdFrom?: string;
  createdTo?: string;
  minAge?: number;
  maxAge?: number;
  minEducationLevel?: number;
  educationMajorIds?: number[];
  countryNames?: string[];
  nationalityNames?: string[];
  vettedOccupationNames?: string[];
  occupationNames?: string[];
  educationMajors?: string[];
  englishWrittenLevel?: string;
  englishSpokenLevel?: string;
  otherWrittenLevel?: string;
  otherSpokenLevel?: string;
  minEducationLevelName?: string;

  searchJoins?: SavedSearchJoin[];
}