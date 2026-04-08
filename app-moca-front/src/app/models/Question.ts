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
  /** Imagen de apoyo (Base64), visible en evaluación */
  supportImage?: string;
  /** Imagen de fondo para dibujar sobre ella (Base64) */
  backgroundImage?: string;
  /** Configuración de tabla dinámica (JSON con columnas y filas) */
  dynamicTableConfig?: string;
  test: TestOnlyId;
  category: CategoryOnlyId;
}
