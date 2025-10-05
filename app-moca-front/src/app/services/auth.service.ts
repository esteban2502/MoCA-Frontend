import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthLoginRequest, AuthResponse, AuthCreateUserRequest } from '../models/Auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl + '/auth/v1';

  constructor(private http: HttpClient) {}

  login(payload: AuthLoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload);
  }

  register(payload: AuthCreateUserRequest): Observable<AuthResponse> {
    // backend mapping uses /singup (typo preserved on server)
    return this.http.post<AuthResponse>(`${this.apiUrl}/singup`, payload);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
  }

  private parseJwt(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch {
      return null;
    }
  }

  getAuthorities(): string[] {
    const token = this.getToken();
    if (!token) return [];
    const decoded = this.parseJwt(token);
    const authorities: string | string[] | undefined = decoded?.authorities;
    if (!authorities) return [];
    if (Array.isArray(authorities)) return authorities;
    return String(authorities).split(',').map(a => a.trim()).filter(Boolean);
  }

  isAdmin(): boolean {
    return this.getAuthorities().includes('ROLE_ADMIN');
  }
}


