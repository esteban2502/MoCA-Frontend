import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Answer } from '../models/Answer';

@Injectable({
  providedIn: 'root'
})
export class AnswerService {

  constructor(private http: HttpClient) { }

  private apiUrl = environment.apiUrl + '/answer/v1';

  getAll(): Observable<Answer[]> {
    return this.http.get<Answer[]>(this.apiUrl);
  }

  getAllByQuestionId(questionId: number): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.apiUrl}/question/${questionId}`);
  }

  getAllByTestId(testId: number): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.apiUrl}/test/${testId}`);
  }

  getAllByResultId(resultId: number): Observable<Answer[]> {
    return this.http.get<Answer[]>(`${this.apiUrl}/result/${resultId}`);
  }

  getById(id: number): Observable<Answer> {
    return this.http.get<Answer>(`${this.apiUrl}/${id}`);
  }

  create(answer: Answer): Observable<void> {
    return this.http.post<void>(this.apiUrl, answer);
  }

  createAll(answers: Answer[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/batch`, answers);
  }

  update(id: number, answer: Answer): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, answer);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
