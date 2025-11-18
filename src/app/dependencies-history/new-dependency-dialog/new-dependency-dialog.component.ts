// src/app/dependencies-history/new-dependency-dialog/new-dependency-dialog.component.ts
import { Component, Inject } from '@angular/core';
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

interface TargetGroup {
  id: string;
  tabela: string;
  registros: RecordItem[];
}

@Component({
  selector: 'app-new-dependency-dialog',
  templateUrl: './new-dependency-dialog.component.html',
  styleUrls: ['./new-dependency-dialog.component.scss']
})
export class NewDependencyDialogComponent {
  // === DADOS DAS TABELAS ===
  tables = ['AUD_SQL', 'AUD_Report', 'AUD_FV'];

  // === SELEÇÃO DE TABELAS ===
  selectedSourceTable: string = '';

  // === REGISTROS SELECIONADOS ===
  selectedSourceRecord: RecordItem | null = null;
  targetGroups: TargetGroup[] = [];

  // === PRIORIDADE ===
  prioridades: string[] = ['Alta', 'Média', 'Baixa'];
  selectedPrioridade: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<NewDependencyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private dialog: MatDialog
  ) {}

  onSourceTableChange() {
    this.selectedSourceRecord = null;
    this.targetGroups = [];
  }

  addTargetGroup() {
    const newGroup: TargetGroup = {
      id: `group-${Date.now()}`,
      tabela: '',
      registros: []
    };
    this.targetGroups.push(newGroup);
  }

  removeTargetGroup(groupId: string) {
    this.targetGroups = this.targetGroups.filter(g => g.id !== groupId);
  }

  onTargetTableChange(group: TargetGroup) {
    group.registros = [];
  }

  openModal(mode: 'origem' | 'destino', group?: TargetGroup) {
    const table = mode === 'origem' 
      ? this.selectedSourceTable 
      : (group ? group.tabela : '');

    if (!table) {
      alert('Selecione uma tabela primeiro.');
      return;
    }

    const dialogRef = this.dialog.open(DependenciesModalComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'dependencies-modal-panel',
      hasBackdrop: true,
      data: { mode: 'destino', table }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (!result) return;

      if (mode === 'origem') {
        const record = Array.isArray(result) ? result[0] : result;
        this.selectedSourceRecord = {
          ...record,
          name: `${record.user} → ${record.tabela}.${record.campo}`
        };
      } else if (group) {
        const records = Array.isArray(result) ? result : [result];
        const newRecords = records.map(r => ({
          ...r,
          name: `${r.user} → ${r.tabela}.${r.campo}`
        }));
        // Adiciona os novos registros ao grupo (permite adicionar mais)
        group.registros = [...group.registros, ...newRecords];
      }
    });
  }

  removeTargetRecord(group: TargetGroup, record: RecordItem) {
    group.registros = group.registros.filter(r => r !== record);
  }

  getTotalDestinos(): number {
    return this.targetGroups.reduce((total, group) => total + group.registros.length, 0);
  }

  saveDependencies() {
    if (!this.selectedSourceRecord) {
      alert('Selecione um registro de origem.');
      return;
    }

    const totalDestinos = this.getTotalDestinos();
    if (totalDestinos === 0) {
      alert('Adicione pelo menos um destino.');
      return;
    }

    // Verifica se todos os grupos têm tabela e registros
    for (const group of this.targetGroups) {
      if (!group.tabela || group.registros.length === 0) {
        alert('Complete todos os grupos de destino antes de salvar.');
        return;
      }
    }

    // Determina o tipo e ID da origem
    const origemTipo = this.getTipoTabela(this.selectedSourceTable);
    const origemId = this.selectedSourceRecord.id;

    // Prepara todos os destinos de todos os grupos
    const destinos: any[] = [];
    this.targetGroups.forEach(group => {
      const tipoDestino = this.getTipoTabela(group.tabela);
      group.registros.forEach(registro => {
        destinos.push({
          tipo: tipoDestino,
          id: registro.id
        });
      });
    });

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
        this.dialogRef.close(true); // Retorna true para indicar sucesso
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

  getAvailableTables(): string[] {
    // Permite todas as tabelas, incluindo a de origem
    return this.tables;
  }

  cancel() {
    this.dialogRef.close(false);
  }
}

