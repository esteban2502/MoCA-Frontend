import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthLoginRequest } from '../../models/Auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  standalone:true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit(): Promise<void> {
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Ingrese correo y contraseña';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    const payload: AuthLoginRequest = { email: this.email, password: this.password };
    try {
      const response = await this.authService.login(payload).toPromise();
      if (response && response.status) {
        localStorage.setItem('token', response.jwt);
        localStorage.setItem('userEmail', response.email);
        localStorage.setItem('userId', String(response.id));
        if (this.authService.isAdmin()) {
          await this.router.navigate(['/pruebas']);
        } else {
          await this.router.navigate(['/evaluacion']);
        }
      } else {
        this.errorMessage = response?.message || 'Error al iniciar sesión';
      }
    } catch (err: any) {
      this.errorMessage = err?.error?.message || 'Credenciales inválidas';
    } finally {
      this.isLoading = false;
    }
  }
}
