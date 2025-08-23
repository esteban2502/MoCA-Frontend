import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Question } from '../models/Question';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  constructor(private http:HttpClient) { }

  private apiUrl = environment.apiUrl+ '/question/v1';

   getAllByTestId(testId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/test/${testId}`);
  }

  create(question: Question): Observable<void> {
    return this.http.post<void>(this.apiUrl, question);
  }

  update(id: number, question: Question): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, question);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
}
