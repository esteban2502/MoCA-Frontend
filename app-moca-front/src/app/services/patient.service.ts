import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Patient } from '../models/Patient';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private apiUrl = environment.apiUrl + '/patients/v1';

  constructor(private http: HttpClient) {}

  list(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.apiUrl);
  }

  create(payload: Partial<Patient>): Observable<Patient> {
    return this.http.post<Patient>(`${this.apiUrl}/register`, payload);
  }

  findByDocument(document: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/cedula/${document}`);
  }
}


