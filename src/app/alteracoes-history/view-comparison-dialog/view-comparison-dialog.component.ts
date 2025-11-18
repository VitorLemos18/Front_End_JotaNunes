// src/app/alteracoes-history/view-comparison-dialog/view-comparison-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';

interface RegistroComparacao {
  id?: string | number;
  codsentenca?: string;
  titulo?: string;
  sentenca?: string;
  aplicacao?: string;
  tamanho?: number;
  codigo?: string;
  descricao?: string;
  nome?: string;
  idcategoria?: number;
  ativo?: boolean;
  reccreatedby?: string;
  reccreatedon?: string;
  recmmodifiedon?: string;  // Data de modificação para AUD_SQL e AUD_FV
  dataultalteracao?: string;  // Data de modificação para AUD_REPORT
  [key: string]: any;
}

@Component({
  selector: 'app-view-comparison-dialog',
  templateUrl: './view-comparison-dialog.component.html',
  styleUrls: ['./view-comparison-dialog.component.scss']
})
export class ViewComparisonDialogComponent implements OnInit {
  registroAtual: RegistroComparacao | null = null;
  registroAnterior: RegistroComparacao | null = null;
  loading = true;
  error = '';
  tabela = '';

  constructor(
    public dialogRef: MatDialogRef<ViewComparisonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { item: any },
    private apiService: ApiService
  ) {
    this.tabela = data.item.tabela;
  }

  ngOnInit(): void {
    this.carregarComparacao();
  }

  carregarComparacao() {
    this.loading = true;
    this.error = '';

    // Passa também a data de modificação para identificar o registro específico selecionado
    const dataModificacao = this.data.item.data_modificacao;
    this.apiService.compararRegistros(this.data.item.tabela, this.data.item.id, dataModificacao).subscribe({
      next: (response: any) => {
        this.registroAtual = response.registro_atual;
        this.registroAnterior = response.registro_anterior;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar comparação:', error);
        this.error = error.error?.error || 'Erro ao carregar comparação. Tente novamente.';
        this.loading = false;
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    // Formato: dd/mm/yy
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2); // Últimos 2 dígitos do ano
    return `${day}/${month}/${year}`;
  }

  isDiferente(campo: string): boolean {
    if (!this.registroAnterior) return false;
    const atual = this.registroAtual?.[campo];
    const anterior = this.registroAnterior[campo];
    return atual !== anterior;
  }

  getCampos(): string[] {
    if (!this.registroAtual) return [];
    
    if (this.tabela === 'AUD_SQL') {
      // AUD_SQL não tem campo 'id' separado, o identificador é o próprio 'codsentenca'
      return ['codsentenca', 'titulo', 'sentenca', 'aplicacao', 'tamanho', 'reccreatedby', 'reccreatedon', 'recmmodifiedon'];
    } else if (this.tabela === 'AUD_REPORT') {
      return ['id', 'codigo', 'descricao', 'codaplicacao', 'reccreatedby', 'reccreatedon', 'dataultalteracao'];
    } else if (this.tabela === 'AUD_FV') {
      return ['id', 'nome', 'descricao', 'idcategoria', 'ativo', 'reccreatedby', 'reccreatedon', 'recmmodifiedon'];
    }
    return [];
  }

  getLabelCampo(campo: string): string {
    const labels: { [key: string]: string } = {
      'codsentenca': 'CODSENTENCA',
      'titulo': 'TÍTULO',
      'sentenca': 'SENTENCA',
      'aplicacao': 'APLICAÇÃO',
      'tamanho': 'TAMANHO',
      'id': 'ID',
      'codigo': 'CÓDIGO',
      'descricao': 'DESCRIÇÃO',
      'codaplicacao': 'CODAPLICAÇÃO',
      'nome': 'NOME',
      'idcategoria': 'IDCATEGORIA',
      'ativo': 'ATIVO',
      'reccreatedby': 'USUÁRIO',
      'reccreatedon': 'DATA CRIAÇÃO',
      'recmmodifiedon': 'DATA MODIFICAÇÃO',
      'dataultalteracao': 'DATA MODIFICAÇÃO'
    };
    return labels[campo] || campo.toUpperCase();
  }
}

