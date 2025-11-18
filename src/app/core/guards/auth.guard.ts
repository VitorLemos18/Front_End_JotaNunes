import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    const token = localStorage.getItem('token'); // Log para depuração
    if (token) {
      return true; // Permite o acesso se o token existir
    } else {
      this.router.navigate(['/login']);
      return false; // Bloqueia o acesso
    }
  }
}