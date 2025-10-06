export interface Patient {
  id?: number;
  documentNumber: string;
  fullName: string;
  birthDate?: string;
  psychologists?: {
    id: number;
    fullName: string;
    email: string;
  }[];
}


