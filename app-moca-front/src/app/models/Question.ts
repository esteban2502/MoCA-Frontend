import { CategoryOnlyId } from "./CategoryOnlyId";
import { TestOnlyId } from "./TestOnlyId";

export interface Question {
  id?: number;
  question: string;
  description: string;
  test: TestOnlyId;
  category: CategoryOnlyId;

}
