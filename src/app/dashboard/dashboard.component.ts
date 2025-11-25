// src/app/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats = [
    { icon: 'database', value: '0', label: 'Fórmulas Visuais' },
    { icon: 'terminal', value: '0', label: 'Consultas SQL' },
    { icon: 'chart-bar', value: '0', label: 'Relatórios' },
    { icon: 'link', value: '0', label: 'Dependências' }
  ];

  operations = [
    { type: 'Alta', count: 0, color: '#c21c1c' },   // vermelho pastel
    { type: 'Média', count: 0, color: '#c68a00' },  // amarelo pastel
    { type: 'Baixa', count: 0, color: '#1a7f1a' }   // verde pastel
  ];

  recent: any[] = [];
  totalOperations = 0;
  isLoading = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    if (this.isLoading) {
      return;
    }
    this.isLoading = true;

    forkJoin({
      insightsFV: this.apiService.getInsightsFV(),        // GET /api/insights/fv
      insightsSQL: this.apiService.getInsightsSQL(),      // GET /api/insights/sql
      insightsReport: this.apiService.getInsightsReport(), // GET /api/insights/report
      insightsDependencias: this.apiService.getInsightsDependencias(), // GET /api/insights/dependencias
      insightsPrioridades: this.apiService.getInsightsPrioridades(), // GET /api/insights/prioridades
      dependencias: this.apiService.getDependencias() // Apenas para atividades recentes
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (data: any) => {
        // Atualiza contadores usando APENAS os endpoints de insights (retornam apenas {count: X})
        this.stats[0].value = (data.insightsFV?.count || 0).toString();
        this.stats[1].value = (data.insightsSQL?.count || 0).toString();
        this.stats[2].value = (data.insightsReport?.count || 0).toString();
        this.stats[3].value = (data.insightsDependencias?.count || 0).toString();

        // Atualiza operações por prioridade usando o endpoint de insights
        const prioridadesData = data.insightsPrioridades || {};
        this.operations[0].count = prioridadesData['Alta'] || 0;
        this.operations[1].count = prioridadesData['Média'] || 0;
        this.operations[2].count = prioridadesData['Baixa'] || 0;

        this.totalOperations = prioridadesData['total'] || 0;

        // Atividades recentes
        const dependenciasList = data.dependencias?.results || data.dependencias || [];
        this.recent = dependenciasList.slice(0, 3).map((d: any) => ({
          action: `Dependência criada`,
          user: d.criado_por_nome || 'Desconhecido',
          time: this.formatTime(d.data_criacao),
          type: d.prioridade_nivel || 'Baixa'
        }));
      },
      error: (err) => {
        console.error('Erro no dashboard:', err);
        this.setFallbackData();
      }
    });
  }


  private formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    return `${mins}m atrás`;
  }

  private setFallbackData() {
    this.stats.forEach(s => s.value = '—');
    this.operations.forEach(op => op.count = 0);
    this.totalOperations = 0;
    this.recent = [
      { action: 'Sistema offline', user: 'Sistema', time: 'agora', type: 'Baixa' }
    ];
  }
}
