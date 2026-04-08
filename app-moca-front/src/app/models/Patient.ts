export interface Patient {
  id?: number;
  documentNumber: string;
  fullName: string;
  birthDate?: string;
  sex?: string;
  sexOtherDescription?: string;
  educationLevel?: string;
  psychologists?: {
    id: number;
    fullName: string;
    email: string;
  }[];
}


