import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserEntity, UserRegistrationRequest, UserLoginRequest } from '../models/UserEntity';

@Injectable({
  providedIn: 'root'
})
export class UserEntityService {
  private apiUrl = 'http://localhost:8080/patients/v1';

  constructor(private http: HttpClient) { }

  // Registrar un nuevo usuario
  register(userData: UserRegistrationRequest): Observable<UserEntity> {
    // Mapear UserRegistrationRequest a UserEntity para el backend
    const userEntity: UserEntity = {
      fullName: userData.fullName,
      idNumber: userData.idNumber,
      academicLevel: userData.academicLevel,
      birthDate: userData.birthDate,
      email: userData.email,
      genero: userData.genero,
      notes: userData.notes,
      password: 'default_password' // Requerido por el backend
    };
    return this.http.post<UserEntity>(`${this.apiUrl}/register`, userEntity);
  }

  // Buscar usuario por cédula
  findByCedula(idNumber: string): Observable<UserEntity> {
    return this.http.get<UserEntity>(`${this.apiUrl}/cedula/${idNumber}`);
  }

  // Obtener todos los usuarios
  getAll(): Observable<UserEntity[]> {
    return this.http.get<UserEntity[]>(this.apiUrl);
  }

  // Obtener usuario por ID
  getById(id: number): Observable<UserEntity> {
    return this.http.get<UserEntity>(`${this.apiUrl}/${id}`);
  }

  // Actualizar usuario
  update(id: number, userData: UserEntity): Observable<UserEntity> {
    return this.http.put<UserEntity>(`${this.apiUrl}/${id}`, userData);
  }

  // Eliminar usuario
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
