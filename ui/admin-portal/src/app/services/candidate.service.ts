import {Injectable} from '@angular/core';
import {Candidate} from '../model/candidate';
import {Observable} from 'rxjs/index';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {SearchResults} from '../model/search-results';
import {map} from "rxjs/operators";

@Injectable({providedIn: 'root'})
export class CandidateService {

  private apiUrl = environment.apiUrl + '/candidate';

  constructor(private http:HttpClient) {}

  search(request): Observable<SearchResults<Candidate>> {
    return this.http.post<SearchResults<Candidate>>(`${this.apiUrl}/search`, request);
  }

  find(request): Observable<SearchResults<Candidate>> {
    return this.http.post<SearchResults<Candidate>>(`${this.apiUrl}/find`, request);
  }

  get(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/${id}`);
  }

  create(details): Observable<Candidate>  {
    return this.http.post<Candidate>(`${this.apiUrl}`, details);
  }

  updateStatus(id: number, details): Observable<Candidate>  {
    return this.http.put<Candidate>(`${this.apiUrl}/${id}/status`, details);
  }

  update(id: number, details): Observable<Candidate>  {
    return this.http.put<Candidate>(`${this.apiUrl}/${id}`, details);
  }

  delete(id: number): Observable<boolean>  {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }

  export(request) {
    return this.http.post(`${this.apiUrl}/export/csv`, request, {responseType: 'blob'});
  }

  downloadCv(candidateId: number) {
    return this.http.get(`${this.apiUrl}/${candidateId}/cv.pdf`, {responseType: 'blob'}).pipe(map(res => {
      return new Blob([res], { type: 'application/pdf', });
    }));
  }


}
