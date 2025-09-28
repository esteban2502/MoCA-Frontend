import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { TestEditorComponent } from './components/test-editor/test-editor.component';
import { QuestionEditorComponent } from './components/question-editor/question-editor.component';
import { MocaTestComponent } from './components/moca-test/moca-test.component';
import { PatientControlComponent } from './components/patient-control/patient-control.component';
import { EvaluationComponent } from './components/evaluation/evaluation.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'pruebas',
    component: TestEditorComponent,
    pathMatch: 'full',
  },
  {
    path: 'preguntas/:id',
    component: QuestionEditorComponent,
    pathMatch: 'full',
  },
  {
    path: 'seguimiento-control',
    component: PatientControlComponent,
    pathMatch: 'full',
  },
  {
    path: 'evaluacion',
    component: EvaluationComponent,
    pathMatch: 'full',
  },
  {
    path: 'moca-test/:id',
    component: MocaTestComponent,
    pathMatch: 'full',
  }
];
