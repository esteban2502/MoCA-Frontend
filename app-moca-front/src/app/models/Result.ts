import { Test } from './Test';
import { Answer } from './Answer';
import { UserEntity } from './UserEntity';
import { Patient } from './Patient';

export interface Result {
  id?: number;
  test: Test;
  user?: UserEntity;
  patient?: Patient;
  answers: Answer[];
  totalScore: number;
  evaluationDate: string;
}
