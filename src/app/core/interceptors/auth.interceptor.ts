import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Obtém o token do localStorage
    const token = localStorage.getItem('token');

    // Se houver token, adiciona ao header Authorization
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Processa a requisição e trata erros
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Se receber 401 (não autorizado), redireciona para login
        if (error.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}





