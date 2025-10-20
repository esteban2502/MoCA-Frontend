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
  emailError = '';

  constructor(private authService: AuthService, private router: Router) {}

  private validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  async onSubmit(): Promise<void> {
    // Limpiar errores previos
    this.emailError = '';
    this.errorMessage = '';

    // Validar que los campos no estén vacíos
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Ingrese correo y contraseña';
      return;
    }

    // Validar formato de email
    if (!this.validateEmail(this.email)) {
      this.emailError = 'Ingrese un formato de correo electrónico válido';
      return;
    }
    
    this.isLoading = true;

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
