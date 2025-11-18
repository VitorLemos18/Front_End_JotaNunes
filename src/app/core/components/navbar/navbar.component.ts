// src/app/core/components/navbar/navbar.component.ts
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Output() logout = new EventEmitter<void>();
  notificacoesNaoLidas = 0;  // ← NOME CORRETO

  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadNotificacoes();
    setInterval(() => this.loadNotificacoes(), 30000);
  }

  loadNotificacoes() {
    this.apiService.getNotificacoes().subscribe({
      next: (data: any[]) => {
        this.notificacoesNaoLidas = data.filter(n => !n.lida).length;
      },
      error: () => {
        this.notificacoesNaoLidas = 0;
      }
    });
  }

  onLogout() {
    this.logout.emit();
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  goToAlerts() {
    this.router.navigate(['/alerts']);
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}