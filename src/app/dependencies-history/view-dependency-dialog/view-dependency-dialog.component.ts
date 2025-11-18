// src/app/dependencies-history/view-dependency-dialog/view-dependency-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { forkJoin } from 'rxjs';

interface RegistroDependencia {
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
  recmmodifiedon?: string;
  dataultalteracao?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-view-dependency-dialog',
  templateUrl: './view-dependency-dialog.component.html',
  styleUrls: ['./view-dependency-dialog.component.scss']
})
export class ViewDependencyDialogComponent implements OnInit {
  registroOrigem: RegistroDependencia | null = null;
  registroDestino: RegistroDependencia | null = null;
  loading = true;
  error = '';
  tabelaOrigem = '';
  tabelaDestino = '';

  constructor(
    public dialogRef: MatDialogRef<ViewDependencyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      origem_tabela: string;
      origem_id: string | number;
      destino_tabela: string;
      destino_id: string | number;
    },
    private apiService: ApiService
  ) {
    this.tabelaOrigem = data.origem_tabela;
    this.tabelaDestino = data.destino_tabela;
  }

  ngOnInit(): void {
    this.carregarRegistros();
  }

  carregarRegistros() {
    this.loading = true;
    this.error = '';

    // Carrega os dois registros em paralelo
    const origem$ = this.apiService.compararRegistros(
      this.data.origem_tabela, 
      this.data.origem_id
    );
    
    const destino$ = this.apiService.compararRegistros(
      this.data.destino_tabela, 
      this.data.destino_id
    );

    // Usa forkJoin para carregar ambos simultaneamente
    forkJoin({
      origem: origem$,
      destino: destino$
    }).subscribe({
      next: (response: any) => {
        // Pega o registro atual de cada um
        this.registroOrigem = response.origem?.registro_atual || null;
        this.registroDestino = response.destino?.registro_atual || null;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar registros:', error);
        this.error = error.error?.error || 'Erro ao carregar registros. Tente novamente.';
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
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  }

  getCampos(tabela: string): string[] {
    if (tabela === 'AUD_SQL') {
      return ['codsentenca', 'titulo', 'sentenca', 'aplicacao', 'tamanho', 'reccreatedby', 'reccreatedon', 'recmmodifiedon'];
    } else if (tabela === 'AUD_REPORT' || tabela === 'AUD_Report') {
      return ['id', 'codigo', 'descricao', 'codaplicacao', 'reccreatedby', 'reccreatedon', 'dataultalteracao'];
    } else if (tabela === 'AUD_FV') {
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

