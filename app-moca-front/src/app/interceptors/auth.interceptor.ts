import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🔍 AuthInterceptor ejecutándose para:', req.url);
  
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  console.log('🔑 Token encontrado:', !!token);
  console.log('🔑 Token valor:', token ? token.substring(0, 20) + '...' : 'null');
  
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('✅ Header Authorization agregado');
    return next(authReq);
  }
  
  console.log('❌ No hay token, enviando request sin Authorization header');
  return next(req);
};
