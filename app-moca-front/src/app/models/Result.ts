import { Test } from './Test';
import { Answer } from './Answer';

export interface Result {
  id?: number;
  test: Test;
  answers: Answer[];
  totalScore: number;
  evaluationDate: string;
}
