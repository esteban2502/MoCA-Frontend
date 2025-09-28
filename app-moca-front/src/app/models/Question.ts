import { CategoryOnlyId } from "./CategoryOnlyId";
import { TestOnlyId } from "./TestOnlyId";

export interface Question {
  id?: number;
  question: string;
  description: string;
  questionOrder?: number;
  maxScore?: number;
  test: TestOnlyId;
  category: CategoryOnlyId;

}
