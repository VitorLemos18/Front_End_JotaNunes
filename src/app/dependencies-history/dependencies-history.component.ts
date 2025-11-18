// src/app/dependencies-history/dependencies-history.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { ViewDependencyDialogComponent } from './view-dependency-dialog/view-dependency-dialog.component';
import { EditDependencyDialogComponent } from './edit-dependency-dialog/edit-dependency-dialog.component';
import { NewDependencyDialogComponent } from './new-dependency-dialog/new-dependency-dialog.component';

interface DependencyHistory {
  id: number;
  origem_tabela?: string;
  origem_id?: string | number;
  origem_nome?: string;
  destino_tabela?: string;
  destino_id?: string | number;
  destino_nome?: string;
  prioridade_nivel?: string;
  criado_por_nome?: string;
  data_criacao: string;
}

@Component({
  selector: 'app-dependencies-history',
  templateUrl: './dependencies-history.component.html',
  styleUrls: ['./dependencies-history.component.scss']
})
export class DependenciesHistoryComponent implements OnInit {
  dependencies: DependencyHistory[] = [];
  loading = true;
  error = '';
  
  // Filtros
  filtroTabela = 'Todas';
  filtroPrioridade = 'Todas';
  searchTerm = '';
  
  // Paginação
  currentPage = 1;
  pageSize = 20;
  totalCount = 0;
  totalPages = 0;
  
  tabelas = ['Todas', 'AUD_SQL', 'AUD_Report', 'AUD_FV'];
  prioridades = ['Todas', 'Alta', 'Média', 'Baixa'];

  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadDependencies();
  }

  abrirNovaDependencia() {
    const dialogRef = this.dialog.open(NewDependencyDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        // Recarrega a lista se uma nova dependência foi criada
        this.loadDependencies();
      }
    });
  }

  loadDependencies() {
    this.loading = true;
    this.error = '';
    
    // Constrói a URL com parâmetros de paginação e filtros
    let url = `${environment.apiUrl}dependencias/?page=${this.currentPage}&page_size=${this.pageSize}`;
    
    // Adiciona filtros se não forem "Todas"
    if (this.filtroTabela !== 'Todas') {
      url += `&origem_tabela=${this.filtroTabela}`;
    }
    if (this.filtroPrioridade !== 'Todas') {
      if (this.filtroPrioridade === 'Sem Prioridade') {
        url += `&sem_prioridade=true`;
      } else {
        url += `&prioridade=${this.filtroPrioridade}`;
      }
    }
    if (this.searchTerm) {
      url += `&search=${encodeURIComponent(this.searchTerm)}`;
    }
    
    this.http.get(url).subscribe({
      next: (data: any) => {
        const results = data.results || data || [];
        this.dependencies = results.map((dep: any) => ({
          id: dep.id,
          origem_tabela: dep.origem_tabela,
          origem_id: dep.origem_id,
          origem_nome: dep.origem_nome,
          destino_tabela: dep.destino_tabela,
          destino_id: dep.destino_id,
          destino_nome: dep.destino_nome,
          prioridade_nivel: dep.prioridade_nivel,
          criado_por_nome: dep.criado_por_nome,
          data_criacao: dep.data_criacao
        }));
        this.totalCount = data.count || results.length;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dependências:', error);
        this.error = 'Erro ao carregar dependências. Tente novamente.';
        this.loading = false;
      }
    });
  }

  onFiltroTabelaChange() {
    this.currentPage = 1;
    this.loadDependencies();
  }

  onFiltroPrioridadeChange() {
    this.currentPage = 1;
    this.loadDependencies();
  }

  onSearchChange() {
    this.currentPage = 1;
    // Debounce para não fazer requisição a cada tecla
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.loadDependencies();
    }, 500);
  }

  searchTimeout: any;

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadDependencies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  deleteDependency(dep: DependencyHistory) {
    if (confirm('Tem certeza que deseja excluir esta dependência?')) {
      this.apiService.deletarDependencia(dep.id).subscribe({
        next: () => {
          this.loadDependencies();
        },
        error: (error) => {
          console.error('Erro ao deletar dependência:', error);
          alert('Erro ao deletar dependência. Tente novamente.');
        }
      });
    }
  }

  getPrioridadeClass(nivel?: string): string {
    if (!nivel) return 'sem-prioridade';
    return nivel.toLowerCase();
  }

  visualizarDependencia(dep: DependencyHistory) {
    if (!dep.origem_tabela || !dep.origem_id || !dep.destino_tabela || !dep.destino_id) {
      alert('Dados incompletos para visualizar a dependência.');
      return;
    }

    this.dialog.open(ViewDependencyDialogComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      data: {
        origem_tabela: dep.origem_tabela,
        origem_id: dep.origem_id,
        destino_tabela: dep.destino_tabela,
        destino_id: dep.destino_id
      }
    });
  }

  editarDependencia(dep: DependencyHistory) {
    if (!dep.origem_tabela || !dep.origem_id || !dep.destino_tabela || !dep.destino_id) {
      alert('Dados incompletos para editar a dependência.');
      return;
    }

    const dialogRef = this.dialog.open(EditDependencyDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      data: {
        id: dep.id,
        origem_tabela: dep.origem_tabela,
        origem_id: dep.origem_id,
        origem_nome: dep.origem_nome || '',
        destino_tabela: dep.destino_tabela,
        destino_id: dep.destino_id,
        destino_nome: dep.destino_nome || '',
        prioridade_nivel: dep.prioridade_nivel
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        // Recarrega a lista se a edição foi bem-sucedida
        this.loadDependencies();
      }
    });
  }
}

