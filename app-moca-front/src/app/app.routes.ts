import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { TestEditorComponent } from './components/test-editor/test-editor.component';
import { QuestionEditorComponent } from './components/question-editor/question-editor.component';
import { MocaTestComponent } from './components/moca-test/moca-test.component';
import { PatientControlComponent } from './components/patient-control/patient-control.component';
import { EvaluationComponent } from './components/evaluation/evaluation.component';
import { authGuard } from './guards/auth.guard';
import { loginRedirectGuard } from './guards/login-redirect.guard';
import { adminGuard } from './guards/admin.guard';
import { UserRegisterComponent } from './components/user-register/user-register.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    pathMatch: 'full',
    canActivate: [loginRedirectGuard]
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
    canActivate: [adminGuard]
  },
  {
    path: 'preguntas/:id',
    component: QuestionEditorComponent,
    pathMatch: 'full',
    canActivate: [authGuard]
  },
  {
    path: 'seguimiento-control',
    component: PatientControlComponent,
    pathMatch: 'full',
    canActivate: [authGuard]
  },
  {
    path: 'evaluacion',
    component: EvaluationComponent,
    pathMatch: 'full',
    canActivate: [authGuard]
  },
  {
    path: 'moca-test/:id',
    component: MocaTestComponent,
    pathMatch: 'full',
    canActivate: [authGuard]
  },
  {
    path: 'usuarios/nuevo',
    component: UserRegisterComponent,
    pathMatch: 'full',
    canActivate: [adminGuard]
  }
];
