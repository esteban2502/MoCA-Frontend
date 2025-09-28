import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Result } from '../models/Result';

@Injectable({
  providedIn: 'root'
})
export class ResultService {

  constructor(private http: HttpClient) { }

  private apiUrl = environment.apiUrl + '/result/v1';

  getAll(): Observable<Result[]> {
    return this.http.get<Result[]>(this.apiUrl);
  }

  getById(id: number): Observable<Result> {
    return this.http.get<Result>(`${this.apiUrl}/${id}`);
  }

  getAllByTestId(testId: number): Observable<Result[]> {
    return this.http.get<Result[]>(`${this.apiUrl}/test/${testId}`);
  }

  create(result: Result): Observable<void> {
    return this.http.post<void>(this.apiUrl, result);
  }

  createFromPayload(payload: any): Observable<void> {
    return this.http.post<void>(this.apiUrl, payload);
  }

  update(id: number, result: Result): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, result);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
