// src/app/dependencies/dependencies.component.ts
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DependenciesModalComponent } from './dependencies-modal/dependencies-modal.component';
import { ApiService } from '../services/api.service';

interface RecordItem {
  id: number | string;
  user: string;
  tabela: string;
  campo: string;
  name: string; // <-- ADICIONADO: nome para exibir
}


@Component({
  selector: 'app-dependencies',
  templateUrl: './dependencies.component.html',
  styleUrls: ['./dependencies.component.scss']
})
export class DependenciesComponent {
  // === DADOS DAS TABELAS ===
  tables = ['AUD_SQL', 'AUD_Report', 'AUD_FV']; // <-- SIMPLIFICADO: só strings

  // === SELEÇÃO DE TABELAS ===
  selectedSourceTable: string = '';
  selectedTargetTable: string = '';

  // === REGISTROS SELECIONADOS ===
  selectedSourceRecord: RecordItem | null = null;
  selectedTargetRecords: RecordItem[] = [];

  // === PRIORIDADE ===
  prioridades: string[] = ['Alta', 'Média', 'Baixa'];
  selectedPrioridade: string | null = null;

  // Limpa registro de origem quando a tabela de origem muda
  onSourceTableChange() {
    this.selectedSourceRecord = null;
    this.selectedTargetTable = '';
    this.selectedTargetRecords = [];
  }

  // Limpa registros de destino quando a tabela de destino muda
  onTargetTableChange() {
    this.selectedTargetRecords = [];
  }

  constructor(
    private dialog: MatDialog,
    private apiService: ApiService
  ) {
  }

  openModal(mode: 'origem' | 'destino') {
    const table = mode === 'origem' ? this.selectedSourceTable : this.selectedTargetTable;

    const dialogRef = this.dialog.open(DependenciesModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'dependencies-modal-panel',
      hasBackdrop: true,
      data: { mode, table }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (!result) return;

      if (mode === 'origem') {
        // espera 1 item
        const record = Array.isArray(result) ? result[0] : result;
        this.selectedSourceRecord = {
          ...record,
          name: `${record.user} → ${record.tabela}.${record.campo}`
        };
      } else {
        // espera vários
        const records = Array.isArray(result) ? result : [result];
        this.selectedTargetRecords = records.map(r => ({
          ...r,
          name: `${r.user} → ${r.tabela}.${r.campo}`
        }));
      }
    });
  }

  saveDependencies() {
    if (!this.selectedSourceRecord || this.selectedTargetRecords.length === 0) {
      alert('Preencha origem e pelo menos um destino.');
      return;
    }

    // Determina o tipo e ID da origem
    const origemTipo = this.getTipoTabela(this.selectedSourceTable);
    const origemId = this.selectedSourceRecord.id;

    // Prepara os destinos
    const destinos = this.selectedTargetRecords.map(dest => ({
      tipo: this.getTipoTabela(this.selectedTargetTable),
      id: dest.id
    }));

    // Prepara o payload para a API
    const payload = {
      origem_tipo: origemTipo,
      origem_id: origemId,
      destinos: destinos,
      prioridade: this.selectedPrioridade || null
    };

    // Salva via API
    this.apiService.criarMultiplasDependencias(payload).subscribe({
      next: (response: any) => {
        alert(`${response.criadas || destinos.length} dependência(s) adicionada(s)!`);
        // Limpa seleção para nova entrada
        this.selectedSourceRecord = null;
        this.selectedTargetRecords = [];
        this.selectedSourceTable = '';
        this.selectedTargetTable = '';
        this.selectedPrioridade = null;
      },
      error: (error) => {
        console.error('Erro ao salvar dependências:', error);
        alert('Erro ao salvar dependências. Tente novamente.');
      }
    });
  }

  getTipoTabela(tabela: string): string {
    if (tabela === 'AUD_SQL') return 'sql';
    if (tabela === 'AUD_Report') return 'report';
    if (tabela === 'AUD_FV') return 'fv';
    return '';
  }


  removeTargetRecord(record: RecordItem) {
    this.selectedTargetRecords = this.selectedTargetRecords.filter(r => r !== record);
  }
}