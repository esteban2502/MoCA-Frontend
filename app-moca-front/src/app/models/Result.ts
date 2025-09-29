import { Test } from './Test';
import { Answer } from './Answer';
import { UserEntity } from './UserEntity';

export interface Result {
  id?: number;
  test: Test;
  user?: UserEntity;
  answers: Answer[];
  totalScore: number;
  evaluationDate: string;
}
