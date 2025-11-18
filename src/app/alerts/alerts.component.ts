// src/app/alerts/alerts.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

interface Alerta {
  id: number;
  titulo: string;
  descricao: string;
  tempo: string;
  tipo: 'alerta' | 'info' | 'confirmacao';
  urgente?: boolean;
  lida: boolean;
}

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnInit {
  filtroAtivo = 'Todas';
  filtros = ['Todas', 'Não lidas', 'Alta', 'Média', 'Baixa'];
  alertas: Alerta[] = [];
  notificacoesNaoLidas = 0;
  alertasCriticos = 0;
  informacoes = 0;
  confirmacoes = 0;
  loading = true;
  error = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAlertas();
  }

  loadAlertas() {
    this.loading = true;
    this.error = '';
    this.apiService.getNotificacoes().subscribe({
      next: (data: any[]) => {
        this.alertas = data.map(n => ({
          id: n.id,
          titulo: n.titulo,
          descricao: n.descricao,
          tempo: this.formatTimeAgo(n.data_hora),
          tipo: this.mapPrioridade(n.prioridade),
          urgente: n.prioridade === 'Alta',
          lida: n.lida
        }));
        this.updateStats();
        this.loading = false;
      },
      error: () => {
        this.error = 'Falha ao carregar alertas.';
        this.alertas = [];
        this.updateStats();
        this.loading = false;
      }
    });
  }

  private formatTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} dia${days > 1 ? 's' : ''} atrás`;
    if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    return `${mins} minuto${mins > 1 ? 's' : ''} atrás`;
  }

  private mapPrioridade(p: string): 'alerta' | 'info' | 'confirmacao' {
    return p === 'Alta' ? 'alerta' : p === 'Média' ? 'confirmacao' : 'info';
  }

  updateStats() {
    this.notificacoesNaoLidas = this.alertas.filter(a => !a.lida).length;
    this.alertasCriticos = this.alertas.filter(a => a.tipo === 'alerta').length;
    this.informacoes = this.alertas.filter(a => a.tipo === 'info').length;
    this.confirmacoes = this.alertas.filter(a => a.tipo === 'confirmacao').length;
  }

  filtrarAlertas(): Alerta[] {
    if (this.filtroAtivo === 'Não lidas') return this.alertas.filter(a => !a.lida);
    if (this.filtroAtivo === 'Alta') return this.alertas.filter(a => a.tipo === 'alerta');
    if (this.filtroAtivo === 'Média') return this.alertas.filter(a => a.tipo === 'confirmacao');
    if (this.filtroAtivo === 'Baixa') return this.alertas.filter(a => a.tipo === 'info');
    return this.alertas;
  }

  marcarComoLida(alerta: Alerta) {
    this.apiService.marcarNotificacaoComoLida(alerta.id).subscribe(() => {
      alerta.lida = true;
      this.updateStats();
    });
  }

  remover(alerta: Alerta) {
    this.alertas = this.alertas.filter(a => a.id !== alerta.id);
    this.updateStats();
  }

  limparTudo() {
    this.alertas = [];
    this.updateStats();
  }

  marcarTodasComoLidas() {
    this.alertas.filter(a => !a.lida).forEach(a => this.marcarComoLida(a));
  }
}