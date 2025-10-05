export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  email: string;
  message: string;
  jwt: string;
  status: boolean;
}

export interface AuthCreateRoleRequest {
  roleListName: string[]; // e.g., ["ADMIN"] or ["USER"]
}

export interface AuthCreateUserRequest {
  name: string;
  idNumber: string;
  email: string;
  password: string;
  roleRequest: AuthCreateRoleRequest;
}


