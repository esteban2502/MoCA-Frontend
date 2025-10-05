import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { AuthCreateUserRequest } from '../../models/Auth';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.css'
})
export class UserRegisterComponent {
  form: AuthCreateUserRequest = {
    name: '',
    idNumber: '',
    email: '',
    password: '',
    roleRequest: { roleListName: ['USER'] }
  };

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthService) {}

  async onSubmit(): Promise<void> {
    if (!this.form.name || !this.form.idNumber || !this.form.email || !this.form.password) {
      this.errorMessage = 'Complete todos los campos obligatorios';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      const res = await this.authService.register(this.form).toPromise();
      if (res?.status) {
        this.successMessage = 'Usuario creado exitosamente';
        this.form = { name: '', idNumber: '', email: '', password: '', roleRequest: { roleListName: ['USER'] } };
      } else {
        this.errorMessage = res?.message || 'Error creando el usuario';
      }
    } catch (err: any) {
      this.errorMessage = err?.error?.message || 'Error creando el usuario';
    } finally {
      this.isLoading = false;
    }
  }
}


