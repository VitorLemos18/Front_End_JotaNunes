// src/app/core/services/api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  // DEPENDÊNCIAS 
  getDependencias(): Observable<any> {
    return this.http.get(`${environment.apiUrl}dependencias/`);
  }

  criarMultiplasDependencias(payload: any): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}dependencias/criar-multiplas/`,
      payload
    );
  }

  deletarDependencia(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}dependencias/${id}/`);
  }

  atualizarDependencia(id: number, payload: any): Observable<any> {
    // Primeiro, obtém a dependência atual para manter os campos necessários
    return this.http.put(`${environment.apiUrl}dependencias/${id}/`, payload);
  }

  //  PRIORIDADES
  getPrioridades(): Observable<any> {
    return this.http.get(`${environment.apiUrl}prioridades/`);
  }

  //  NOTIFICAÇÕES 
  getNotificacoes(): Observable<any> {
    return this.http.get(`${environment.apiUrl}notificacoes/`);
  }

  marcarNotificacaoComoLida(id: number): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}notificacoes/${id}/marcar_lida/`,
      {}
    );
  }

  // HISTÓRICO DE ALTERAÇÕES 
  getHistoricoAlteracoes(page: number = 1, pageSize: number = 20, dataInicio?: string, dataFim?: string, tabela?: string): Observable<any> {
    let url = `${environment.apiUrl}historico-alteracoes/?page=${page}&page_size=${pageSize}`;
    if (dataInicio) {
      url += `&data_inicio=${encodeURIComponent(dataInicio)}`;
    }
    if (dataFim) {
      url += `&data_fim=${encodeURIComponent(dataFim)}`;
    }
    if (tabela && tabela !== 'Todas') {
      url += `&tabela=${encodeURIComponent(tabela)}`;
    }
    return this.http.get(url);
  }

  // REGISTROS MODAL 
  getRegistrosModal(tabela: string): Observable<any> {
    return this.http.get(
      `${environment.apiUrl}registros-modal/?tabela=${tabela}`
    );
  }

  // INSIGHTS
  getInsightsFV(): Observable<any> {
    return this.http.get(`${environment.apiUrl}insights/fv`);
  }

  getInsightsSQL(): Observable<any> {
    return this.http.get(`${environment.apiUrl}insights/sql`);
  }

  getInsightsReport(): Observable<any> {
    return this.http.get(`${environment.apiUrl}insights/report`);
  }

  getInsightsDependencias(): Observable<any> {
    return this.http.get(`${environment.apiUrl}insights/dependencias`);
  }

  getInsightsPrioridades(): Observable<any> {
    return this.http.get(`${environment.apiUrl}insights/prioridades`);
  }

  // OBSERVAÇÕES 
  criarObservacao(texto: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}observacoes/`, { texto });
  }

  adicionarObservacaoRegistro(tabela: string, id: string | number, texto: string, dataModificacao?: string): Observable<any> {
    const payload: any = {
      tabela,
      id,
      texto
    };
    if (dataModificacao) {
      payload.data_modificacao = dataModificacao;
    }
    return this.http.post(`${environment.apiUrl}adicionar-observacao-registro/`, payload);
  }

  // COMPARAÇÃO DE REGISTROS
  compararRegistros(tabela: string, id: string | number, dataModificacao?: string): Observable<any> {
    let url = `${environment.apiUrl}comparar-registros/?tabela=${tabela}&id=${id}`;
    if (dataModificacao) {
      url += `&data_modificacao=${encodeURIComponent(dataModificacao)}`;
    }
    return this.http.get(url);
  }
}