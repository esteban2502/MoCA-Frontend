export interface UserEntity {
  id?: number;
  fullName: string;
  idNumber: string; // cedula
  password: string;
  academicLevel: string;
  birthDate: string;
  email: string;
  genero: string; // MASCULINO, FEMENINO, OTRO
  active?: boolean;
  notes?: string;
  isEnabled?: boolean;
  accountNoExpired?: boolean;
  accountNoLocked?: boolean;
  credentialNoExpired?: boolean;
}

export interface UserRegistrationRequest {
  fullName: string;
  idNumber: string;
  academicLevel: string;
  birthDate: string;
  email: string;
  genero: string;
  notes?: string;
}

export interface UserLoginRequest {
  idNumber: string;
}
