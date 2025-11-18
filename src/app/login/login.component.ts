import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false; // Campo para "Lembrar-me"
  errorMessage: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    console.log('Tentando login com:', { email: this.email, password: this.password, rememberMe: this.rememberMe });

    this.http.post(`${environment.apiUrl}token/`, {
      username: this.email,
      password: this.password
    }).subscribe(
      (response: any) => {
        console.log('Resposta do login:', response);
        if (response.access) {
          localStorage.setItem('token', response.access); // Salva o token de acesso
          console.log('Token salvo:', response.access);

          // Se "Lembrar-me" estiver marcado, pode salvar o refresh token (se disponível)
          if (this.rememberMe && response.refresh) {
            localStorage.setItem('refreshToken', response.refresh); // Opcional, depende do backend
          }

          // Redireciona com base na última rota ou para /dashboard por padrão
          const redirectUrl = this.router.url === '/login' ? '/dashboard' : this.router.url;
          this.router.navigate([redirectUrl]);
        } else {
          console.error('Token de acesso não encontrado na resposta');
          this.errorMessage = 'Token inválido recebido';
        }
      },
      (error) => {
        console.error('Erro no login:', error);
        this.errorMessage = error.error?.detail || 'Erro de autenticação. Verifique suas credenciais.';
      }
    );
  }
}