// Utilidad para debuggear el token
export function debugToken() {
  const token = localStorage.getItem('token');
  console.log('=== DEBUG TOKEN ===');
  console.log('Token en localStorage:', token);
  console.log('Token existe:', !!token);
  console.log('localStorage completo:', localStorage);
  
  if (token) {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      console.log('Token decodificado:', decoded);
      console.log('Token expirado:', new Date(decoded.exp * 1000) < new Date());
    } catch (e) {
      console.log('Error decodificando token:', e);
    }
  }
  console.log('==================');
}

// Función para limpiar el localStorage
export function clearToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userId');
  console.log('🧹 Token y datos de usuario limpiados');
  debugToken();
}

// Función para simular un token de prueba
export function setTestToken() {
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcklkIjoxLCJhdXRob3JpdGllcyI6IlJPTEVfVVNFUiIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxNjM0NjU0MjkwfQ.test';
  localStorage.setItem('token', testToken);
  console.log('Token de prueba guardado');
  debugToken();
}

// Función para probar el interceptor haciendo una request
export async function testInterceptor() {
  console.log('🧪 Probando interceptor...');
  
  try {
    const response = await fetch('/api/patients/v1', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', [...response.headers.entries()]);
    
  } catch (error) {
    console.log('❌ Error en la request:', error);
  }
}
