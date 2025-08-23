import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Test } from '../models/Test';

@Injectable({
  providedIn: 'root',
})
export class TestService {
  constructor(private http: HttpClient) {}

  private apiUrl = environment.apiUrl + '/test/v1';

  // GET: obtener todos los tests
  getAll(): Observable<Test[]> {
    return this.http.get<Test[]>(this.apiUrl);
  }

  // POST: guardar nuevo test
  save(test: Test): Observable<void> {
    return this.http.post<void>(this.apiUrl, test);
  }

  // PUT: actualizar test existente
  update(id: number, test: Test): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, test);
  }

  // DELETE: eliminar test por id
  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  changeStatus(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, {});
  }
}
