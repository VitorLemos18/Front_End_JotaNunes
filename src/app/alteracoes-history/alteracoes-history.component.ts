// src/app/alteracoes-history/alteracoes-history.component.ts
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { AddObservacaoDialogComponent } from './add-observacao-dialog/add-observacao-dialog.component';
import { ViewComparisonDialogComponent } from './view-comparison-dialog/view-comparison-dialog.component';

interface HistoricoItem {
  tabela: string;
  id: string | number;
  codsentenca?: string;
  titulo?: string;
  nome?: string;
  descricao?: string;
  reccreatedby?: string;
  prioridade?: string;
  observacao?: string;
  data_criacao?: string;
  data_modificacao?: string;
}

@Component({
  selector: 'app-alteracoes-history',
  templateUrl: './alteracoes-history.component.html',
  styleUrls: ['./alteracoes-history.component.scss']
})
export class AlteracoesHistoryComponent implements OnInit {
  historico: HistoricoItem[] = [];
  historicoFiltrado: HistoricoItem[] = [];
  loading = true;
  error = '';

  // Tabela
  displayedColumns: string[] = ['tabela', 'id', 'campo1', 'usuario', 'data_criacao', 'data_modificacao', 'acoes'];
  shouldShowPrioridade = false;
  shouldShowObservacao = false;

  // Paginação
  currentPage = 1;
  pageSize = 20;
  totalCount = 0;
  totalPages = 0;

  // Filtros
  filtroTabela = 'Todas';
  tabelas = ['Todas', 'AUD_SQL', 'AUD_REPORT', 'AUD_FV'];
  filtroBusca = '';
  dataInicio: Date | null = null;
  dataFim: Date | null = null;

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadHistorico();
  }

  loadHistorico() {
    this.loading = true;
    this.error = '';

    // Formata datas para o formato esperado pelo backend (YYYY-MM-DD)
    const dataInicioStr = this.dataInicio ? this.formatDateForApi(this.dataInicio) : undefined;
    const dataFimStr = this.dataFim ? this.formatDateForApi(this.dataFim) : undefined;

    this.apiService.getHistoricoAlteracoes(
      this.currentPage, 
      this.pageSize, 
      dataInicioStr, 
      dataFimStr,
      this.filtroTabela
    ).subscribe({
      next: (data: any) => {
        this.historico = data.results || [];
        this.totalCount = data.count || this.historico.length;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.aplicarFiltroBusca();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar histórico:', error);
        this.error = 'Erro ao carregar histórico de alterações. Tente novamente.';
        this.loading = false;
      }
    });
  }

  formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onFiltroTabelaChange() {
    this.currentPage = 1;
    this.loadHistorico();
  }

  onFiltroDataChange() {
    this.currentPage = 1;
    this.loadHistorico();
  }

  limparFiltros() {
    this.dataInicio = null;
    this.dataFim = null;
    this.filtroTabela = 'Todas';
    this.filtroBusca = '';
    this.currentPage = 1;
    this.loadHistorico();
  }

  exportarParaExcel() {
    // Busca todos os dados com os filtros aplicados (sem paginação)
    const dataInicioStr = this.dataInicio ? this.formatDateForApi(this.dataInicio) : undefined;
    const dataFimStr = this.dataFim ? this.formatDateForApi(this.dataFim) : undefined;

    this.apiService.getHistoricoAlteracoes(
      1, 
      10000, // Busca muitos registros para exportar
      dataInicioStr, 
      dataFimStr,
      this.filtroTabela
    ).subscribe({
      next: (data: any) => {
        const registros = data.results || [];
        this.gerarExcel(registros);
      },
      error: (error) => {
        console.error('Erro ao buscar dados para exportação:', error);
        alert('Erro ao exportar dados. Tente novamente.');
      }
    });
  }

  async gerarExcel(registros: HistoricoItem[]) {
    try {
      const XLSX = await import('xlsx');
      
      // Prepara os dados para o Excel
      const dadosExcel = registros.map(item => ({
        'Tabela': this.getTabelaDisplayName(item.tabela),
        [this.getLabelCampo1(item.tabela)]: this.getCampo1(item),
        [this.getLabelCampo2(item.tabela)]: this.getCampo2(item),
        'Usuário': item.reccreatedby || 'N/A',
        'Prioridade': item.prioridade || '—',
        'Observação': item.observacao || '—',
        'Data de Criação': item.data_criacao ? this.formatDate(item.data_criacao) : 'N/A',
        'Data de Modificação': item.data_modificacao ? this.formatDate(item.data_modificacao) : '—'
      }));

      // Cria a planilha
      const ws = XLSX.utils.json_to_sheet(dadosExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Histórico de Alterações');

      // Gera o nome do arquivo com data/hora
      const agora = new Date();
      const dataStr = agora.toISOString().slice(0, 10).replace(/-/g, '');
      const horaStr = agora.toTimeString().slice(0, 8).replace(/:/g, '');
      const nomeArquivo = `historico_alteracoes_${dataStr}_${horaStr}.xlsx`;

      // Faz o download
      XLSX.writeFile(wb, nomeArquivo);
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      alert('Erro ao exportar para Excel. Verifique se a biblioteca xlsx está instalada.');
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadHistorico();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearchChange(value: string) {
    this.filtroBusca = value;
    this.aplicarFiltroBusca();
  }

  private aplicarFiltroBusca() {
    const termo = this.filtroBusca.trim().toLowerCase();
    if (!termo) {
      this.historicoFiltrado = [...this.historico];
    } else {
      this.historicoFiltrado = this.historico.filter(item => {
        const campos = [
          this.getTabelaDisplayName(item.tabela),
          this.getCampo1(item),
          this.getCampo2(item),
          item.reccreatedby || ''
        ].join(' ').toLowerCase();
        return campos.includes(termo);
      });
    }
    this.atualizarColunasDinamicas();
  }

  private atualizarColunasDinamicas() {
    const dataset = this.historicoFiltrado.length ? this.historicoFiltrado : this.historico;
    this.shouldShowPrioridade = dataset.some(item => !!item.prioridade?.trim());
    this.shouldShowObservacao = dataset.some(item => !!item.observacao?.trim());

    const columns = ['tabela', 'id', 'campo1', 'usuario'];
    if (this.shouldShowPrioridade) {
      columns.push('prioridade');
    }
    if (this.shouldShowObservacao) {
      columns.push('observacao');
    }
    columns.push('data_criacao', 'data_modificacao', 'acoes');
    this.displayedColumns = columns;
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

  getPrioridadeClass(nivel?: string): string {
    if (!nivel) return 'sem-prioridade';
    return nivel.toLowerCase();
  }

  getTabelaDisplayName(tabela: string): string {
    const names: { [key: string]: string } = {
      'AUD_SQL': 'AUD_SQL',
      'AUD_REPORT': 'AUD_REPORT',
      'AUD_FV': 'AUD_FV'
    };
    return names[tabela] || tabela;
  }

  getTabelaBadgeClass(tabela: string): string {
    const map: { [key: string]: string } = {
      'AUD_SQL': 'badge-sql',
      'AUD_REPORT': 'badge-report',
      'AUD_FV': 'badge-fv'
    };
    return map[tabela] || 'badge-default';
  }

  getCampo1(item: HistoricoItem): string {
    if (item.tabela === 'AUD_SQL') return item.codsentenca || item.id?.toString() || 'N/A';
    if (item.tabela === 'AUD_REPORT') return item.id?.toString() || 'N/A';
    if (item.tabela === 'AUD_FV') return item.id?.toString() || 'N/A';
    return 'N/A';
  }

  getCampo2(item: HistoricoItem): string {
    if (item.tabela === 'AUD_SQL') return item.titulo || 'N/A';
    if (item.tabela === 'AUD_REPORT') return item.descricao || 'N/A';
    if (item.tabela === 'AUD_FV') return item.nome || 'N/A';
    return 'N/A';
  }


  getLabelCampo1(tabela: string): string {
    if (tabela === 'AUD_SQL') return 'CODSENTENCA';
    if (tabela === 'AUD_REPORT') return 'ID';
    if (tabela === 'AUD_FV') return 'ID';
    return 'ID';
  }

  getLabelCampo2(tabela: string): string {
    if (tabela === 'AUD_SQL') return 'TÍTULO';
    if (tabela === 'AUD_REPORT') return 'DESCRIÇÃO';
    if (tabela === 'AUD_FV') return 'NOME';
    return 'Campo';
  }

  getUsuarioLabel(): string {
    const tabela = this.getTabelaReferencia();
    if (tabela === 'AUD_REPORT') return 'USRULTALTERACAO';
    if (tabela === 'AUD_SQL' || tabela === 'AUD_FV') return 'RECMODIFIEDBY';
    return 'Usuário';
  }

  getTabelaReferencia(): string {
    if (this.historicoFiltrado.length > 0) {
      return this.historicoFiltrado[0].tabela;
    }
    if (this.historico.length > 0) {
      return this.historico[0].tabela;
    }
    return '';
  }

  adicionarObservacao(item: HistoricoItem): void {
    const dialogRef = this.dialog.open(AddObservacaoDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: false,
      data: { item }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        // Recarrega os dados para exibir a observação na tabela
        this.loadHistorico();
      }
    });
  }

  visualizarComparacao(item: HistoricoItem): void {
    this.dialog.open(ViewComparisonDialogComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      data: { item }
    });
  }
}

