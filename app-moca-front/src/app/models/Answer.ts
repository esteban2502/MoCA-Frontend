import { Question } from './Question';

export interface Answer {
  id?: number;
  question: Question;
  userAnswer: string;
  textResponse?: string;
  score: number | null;
  notes: string;
}
