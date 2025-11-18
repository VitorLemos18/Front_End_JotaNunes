// src/app/dependencies-history/edit-dependency-dialog/edit-dependency-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { DependenciesModalComponent } from '../../dependencies/dependencies-modal/dependencies-modal.component';
import { MatDialog } from '@angular/material/dialog';

interface RecordItem {
  id: number | string;
  user: string;
  tabela: string;
  campo: string;
  name: string;
}

@Component({
  selector: 'app-edit-dependency-dialog',
  templateUrl: './edit-dependency-dialog.component.html',
  styleUrls: ['./edit-dependency-dialog.component.scss']
})
export class EditDependencyDialogComponent implements OnInit {
  // === DADOS DAS TABELAS ===
  tables = ['AUD_SQL', 'AUD_Report', 'AUD_FV'];

  // === SELEÇÃO DE TABELAS ===
  selectedSourceTable: string = '';
  selectedTargetTable: string = '';

  // === REGISTROS SELECIONADOS ===
  selectedSourceRecord: RecordItem | null = null;
  selectedTargetRecords: RecordItem[] = [];

  // === PRIORIDADE ===
  prioridades: string[] = ['Alta', 'Média', 'Baixa'];
  selectedPrioridade: string | null = null;

  // === DADOS ORIGINAIS ===
  dependencyId: number;
  originalPrioridade: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<EditDependencyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      id: number;
      origem_tabela: string;
      origem_id: string | number;
      origem_nome: string;
      destino_tabela: string;
      destino_id: string | number;
      destino_nome: string;
      prioridade_nivel?: string;
    },
    private apiService: ApiService,
    private dialog: MatDialog
  ) {
    this.dependencyId = data.id;
    this.selectedSourceTable = data.origem_tabela;
    this.selectedTargetTable = data.destino_tabela;
    this.selectedPrioridade = data.prioridade_nivel || null;
    this.originalPrioridade = data.prioridade_nivel || null;

    // Pré-seleciona os registros
    this.selectedSourceRecord = {
      id: data.origem_id,
      user: '',
      tabela: data.origem_tabela,
      campo: '',
      name: `ID ${data.origem_id} - ${data.origem_nome}`
    };

    this.selectedTargetRecords = [{
      id: data.destino_id,
      user: '',
      tabela: data.destino_tabela,
      campo: '',
      name: `ID ${data.destino_id} - ${data.destino_nome}`
    }];
  }

  ngOnInit(): void {
  }

  onSourceTableChange() {
    this.selectedSourceRecord = null;
    this.selectedTargetTable = '';
    this.selectedTargetRecords = [];
  }

  onTargetTableChange() {
    this.selectedTargetRecords = [];
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
        const record = Array.isArray(result) ? result[0] : result;
        this.selectedSourceRecord = {
          ...record,
          name: `${record.user} → ${record.tabela}.${record.campo}`
        };
      } else {
        const records = Array.isArray(result) ? result : [result];
        this.selectedTargetRecords = records.map(r => ({
          ...r,
          name: `${r.user} → ${r.tabela}.${r.campo}`
        }));
      }
    });
  }

  removeTargetRecord(record: RecordItem) {
    this.selectedTargetRecords = this.selectedTargetRecords.filter(r => r !== record);
  }

  saveDependency() {
    if (!this.selectedSourceRecord || this.selectedTargetRecords.length === 0) {
      alert('Preencha origem e pelo menos um destino.');
      return;
    }

    // Verificações de null safety
    if (!this.selectedSourceRecord) {
      alert('Selecione um registro de origem.');
      return;
    }

    const primeiroDestino = this.selectedTargetRecords[0];
    if (!primeiroDestino) {
      alert('Selecione pelo menos um registro de destino.');
      return;
    }

    // Prepara o payload no formato que o backend espera (campos do modelo)
    // O modelo precisa ter exatamente 2 campos preenchidos (origem e destino)
    const payload: any = {
      id_aud_sql: null,
      id_aud_report: null,
      id_aud_fv: null
    };

    // Define origem e destino nos campos corretos
    const origemId = this.selectedSourceRecord.id;
    const destinoId = primeiroDestino.id;

    // Define a origem
    if (this.selectedSourceTable === 'AUD_SQL') {
      payload.id_aud_sql = origemId;
    } else if (this.selectedSourceTable === 'AUD_Report') {
      payload.id_aud_report = origemId;
    } else if (this.selectedSourceTable === 'AUD_FV') {
      payload.id_aud_fv = origemId;
    }

    // Define o destino (só define se for diferente da origem)
    if (this.selectedTargetTable === 'AUD_SQL' && this.selectedSourceTable !== 'AUD_SQL') {
      payload.id_aud_sql = destinoId;
    } else if (this.selectedTargetTable === 'AUD_Report' && this.selectedSourceTable !== 'AUD_Report') {
      payload.id_aud_report = destinoId;
    } else if (this.selectedTargetTable === 'AUD_FV' && this.selectedSourceTable !== 'AUD_FV') {
      payload.id_aud_fv = destinoId;
    }

    // Atualiza via API
    this.apiService.atualizarDependencia(this.dependencyId, payload).subscribe({
      next: (response: any) => {
        // Se a prioridade foi alterada, atualiza também
        if (this.selectedPrioridade !== this.originalPrioridade && this.selectedSourceRecord) {
          // Usa o mesmo endpoint de criar múltiplas para atualizar prioridade
          const origemTipo = this.getTipoTabela(this.selectedSourceTable);
          const origemId = this.selectedSourceRecord.id;
          const destinos = this.selectedTargetRecords.map(dest => ({
            tipo: this.getTipoTabela(this.selectedTargetTable),
            id: dest.id
          }));

          this.apiService.criarMultiplasDependencias({
            origem_tipo: origemTipo,
            origem_id: origemId,
            destinos: destinos,
            prioridade: this.selectedPrioridade || null
          }).subscribe({
            next: () => {
              alert('Dependência atualizada com sucesso!');
              this.dialogRef.close(true);
            },
            error: (error) => {
              console.error('Erro ao atualizar prioridade:', error);
              alert('Dependência atualizada, mas houve erro ao atualizar prioridade.');
              this.dialogRef.close(true);
            }
          });
        } else {
          alert('Dependência atualizada com sucesso!');
          this.dialogRef.close(true);
        }
      },
      error: (error) => {
        console.error('Erro ao atualizar dependência:', error);
        alert('Erro ao atualizar dependência. Tente novamente.');
      }
    });
  }

  getTipoTabela(tabela: string): string {
    if (tabela === 'AUD_SQL') return 'sql';
    if (tabela === 'AUD_Report') return 'report';
    if (tabela === 'AUD_FV') return 'fv';
    return '';
  }

  cancel() {
    this.dialogRef.close(false);
  }
}

