import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  console.log('🔍 Auth Interceptor - URL:', req.url);
  console.log('🔍 Auth Interceptor - Token:', token ? 'Presente' : 'Ausente');
  
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    console.log('🔍 Auth Interceptor - Headers:', authReq.headers.get('Authorization'));
    return next(authReq);
  }
  
  console.log('🔍 Auth Interceptor - Sin token, enviando request sin Authorization');
  return next(req);
};
