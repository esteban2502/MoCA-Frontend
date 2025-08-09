import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { TestEditorComponent } from './components/test-editor/test-editor.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'pruebas',
    component: TestEditorComponent,
    pathMatch: 'full'
  }
];
