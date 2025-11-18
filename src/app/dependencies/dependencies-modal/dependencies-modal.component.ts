import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { ApiService } from '../../services/api.service';

interface Registro {
  id: string | number;
  user: string;
  tabela: string;
  campo: string;
}

@Component({
  selector: 'app-dependencies-modal',
  templateUrl: './dependencies-modal.component.html',
  styleUrls: ['./dependencies-modal.component.scss']
})
export class DependenciesModalComponent implements OnInit {
  displayedColumns: string[] = [];
  dataSource: Registro[] = [];
  dadosFiltrados: Registro[] = [];
  filtro = '';
  selection: SelectionModel<Registro>;
  mode: 'origem' | 'destino' = 'destino';
  table: string = '';
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<DependenciesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'origem' | 'destino', table: string },
    private apiService: ApiService
  ) {
    if (data) {
      this.mode = data.mode || 'destino';
      this.table = data.table || '';
    }
    // Permite múltipla seleção apenas no modo destino
    this.selection = new SelectionModel<Registro>(this.mode === 'destino', []);
    // Define as colunas baseado no modo
    this.displayedColumns = this.mode === 'destino' 
      ? ['select', 'user', 'tabela', 'campo']
      : ['select', 'user', 'tabela', 'campo'];
  }

  ngOnInit() {
    this.carregarRegistros();
  }

  carregarRegistros() {
    if (!this.table) {
      return;
    }
    
    this.loading = true;
    this.apiService.getRegistrosModal(this.table).subscribe({
      next: (data: Registro[]) => {
        this.dataSource = data;
        this.dadosFiltrados = [...this.dataSource];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar registros:', error);
        this.dataSource = [];
        this.dadosFiltrados = [];
        this.loading = false;
      }
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dadosFiltrados.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.mode === 'destino') {
      this.isAllSelected()
        ? this.selection.clear()
        : this.dadosFiltrados.forEach(row => this.selection.select(row));
    }
  }

  toggleRow(row: Registro) {
    if (this.mode === 'origem') {
      // No modo origem, apenas uma seleção é permitida
      this.selection.clear();
      this.selection.select(row);
    } else {
      // No modo destino, permite múltipla seleção
      this.selection.toggle(row);
    }
  }

  aplicarFiltro() {
    const termo = this.filtro.toLowerCase().trim();
    this.dadosFiltrados = this.dataSource.filter(item =>
      item.user.toLowerCase().includes(termo) ||
      item.tabela.toLowerCase().includes(termo) ||
      item.campo.toLowerCase().includes(termo)
    );
  }

  cancelar() {
    this.dialogRef.close();
  }

  salvar() {
    if (this.mode === 'origem') {
      // No modo origem, retorna apenas o primeiro item selecionado
      this.dialogRef.close(this.selection.selected.length > 0 ? this.selection.selected[0] : null);
    } else {
      // No modo destino, retorna todos os itens selecionados
      this.dialogRef.close(this.selection.selected);
    }
  }
}