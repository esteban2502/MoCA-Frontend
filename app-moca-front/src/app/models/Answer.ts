import { Question } from './Question';

export interface Answer {
  id?: number;
  question: Question;
  userAnswer: string;
  /** Respuesta de tabla dinámica (JSON con celdas seleccionadas) */
  dynamicTableResponse?: string;
  /** Vista calculada de tabla dinámica para evaluación (no se envía al backend). */
  dynamicTableView?: {
    columns: string[];
    rows: string[];
    selection: { [key: string]: boolean };
  } | null;
  textResponse?: string;
  score: number | null;
  notes: string;
}
