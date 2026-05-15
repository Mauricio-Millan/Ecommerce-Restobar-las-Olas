import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '../auth/session.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const token = session.getAccessToken();
  
  if (token) {
    // ✅ Token disponible: añadir Authorization header
    console.log(`[authInterceptor] Adding Authorization header to ${req.method} ${req.url}`);
    const cloned = req.clone({ 
      setHeaders: { 
        Authorization: `Bearer ${token}` 
      } 
    });
    return next(cloned);
  }
  
  // ℹ️ Sin token: petición sin Authorization
  console.log(`[authInterceptor] No token available for ${req.method} ${req.url}`);
  return next(req);
};

