import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  
  console.log('🔍 Auth Interceptor - URL:', req.url);
  console.log('🔍 Auth Interceptor - Token:', token ? 'Presente' : 'Ausente');
  
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('🔍 Auth Interceptor - Headers:', authReq.headers.get('Authorization'));
    
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('🔍 Auth Interceptor - Error capturado:', error.status);
        
        // Si es 401, el token es inválido, cerrar sesión
        if (error.status === 401) {
          console.log('❌ Token inválido, redirigiendo al login');
          authService.logout();
          router.navigate(['/login']);
        }

        // Para 403 u otros errores, dejar que el componente maneje la respuesta
        
        return throwError(() => error);
      })
    );
  }
  
  console.log('🔍 Auth Interceptor - Sin token, enviando request sin Authorization');
  return next(req);
};
