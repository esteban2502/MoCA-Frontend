import { CategoryOnlyId } from "./CategoryOnlyId";
import { TestOnlyId } from "./TestOnlyId";

export interface Question {
  id?: number;
  question: string;
  description: string;
  questionOrder?: number;
  maxScore?: number;
  isDrawing?: boolean;
  status?: boolean;
  test: TestOnlyId;
  category: CategoryOnlyId;

}
