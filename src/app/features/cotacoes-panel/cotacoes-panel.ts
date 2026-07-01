import { Component, inject, OnInit, ViewChild, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FreteService } from '../../core/services/frete.service';
import { Frete } from '../../core/models/frete.model';
import { SearchModal } from '../acompanhamento-panel/components/search-modal/search-modal';

export interface CotacaoTabela {
  id: string;
  freteId: string;
  aglutinadorId?: string;
  cliente: string;
  dataInicioJanela: string;
  dataFimJanela: string;
  dataNecessidadeEntrega: string;
  fluxo: string;
  solicitante: string;
  status: string;
  transportador: string;
}

@Component({
  selector: 'app-cotacoes-panel',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatTableModule, 
    MatPaginatorModule,
    MatButtonModule, 
    MatIconModule, 
    MatCardModule, 
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './cotacoes-panel.html',
  styleUrls: ['./cotacoes-panel.css']
})
export class CotacoesPanel implements OnInit {
  private freteService = inject(FreteService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  fretes = this.freteService.fretes;
  dataSource = new MatTableDataSource<CotacaoTabela>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  displayedColumns: string[] = ['id', 'freteId', 'aglutinadorId', 'cliente', 'dataInicioJanela', 'dataFimJanela', 'dataNecessidadeEntrega', 'fluxo', 'solicitante', 'status', 'acoes'];

  titulo = 'Acompanhamento de Cotações';
  showFilters = signal(true);

  // Filters
  id = '';
  cliente = '';
  fornecedor = '';
  transportador = '';
  grpTransportador = '';
  usuario = '';
  numeroPedido = '';
  codigoColeta = '';
  dataInicial: Date | null = null;
  dataFinal: Date | null = null;
  etapas: string[] = [];
  statusSelecionados: string[] = [];

  // Dropdown Usuários
  usuariosList: string[] = ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Ferreira', 'Fernanda Lima', 'Roberto Alves', 'Juliana Souza', 'Marcos Ribeiro', 'Patricia Martins'];
  filteredUsuarios: string[] = [...this.usuariosList];
  usuarioSearch = '';

  constructor() {
    effect(() => {
      // Re-filter whenever fretes signal changes
      const _ = this.fretes();
      this.aplicarFiltro();
    });
  }

  toggleFilters() {
    this.showFilters.update(v => !v);
  }

  get allCotacoes(): CotacaoTabela[] {
    const list: CotacaoTabela[] = [];
    for (const f of this.fretes()) {
      if (f.id === '21978') {
        list.push({
          id: 'COT-21978-1',
          freteId: f.id,
          aglutinadorId: f.aglutinadorId,
          cliente: f.cliente,
          dataInicioJanela: f.dataInicioJanela,
          dataFimJanela: f.dataFimJanela,
          dataNecessidadeEntrega: f.dataNecessidadeEntrega,
          fluxo: f.fluxo,
          solicitante: f.solicitante,
          status: 'Aprovado',
          transportador: 'MIRASSOL'
        });
        list.push({
          id: 'COT-21978-2',
          freteId: f.id,
          aglutinadorId: f.aglutinadorId,
          cliente: f.cliente,
          dataInicioJanela: f.dataInicioJanela,
          dataFimJanela: f.dataFimJanela,
          dataNecessidadeEntrega: f.dataNecessidadeEntrega,
          fluxo: f.fluxo,
          solicitante: f.solicitante,
          status: 'Pendente',
          transportador: 'VF (IVOTI)'
        });
        list.push({
          id: 'COT-21978-3',
          freteId: f.id,
          aglutinadorId: f.aglutinadorId,
          cliente: f.cliente,
          dataInicioJanela: f.dataInicioJanela,
          dataFimJanela: f.dataFimJanela,
          dataNecessidadeEntrega: f.dataNecessidadeEntrega,
          fluxo: f.fluxo,
          solicitante: f.solicitante,
          status: 'Declinada',
          transportador: 'M3 LOGÍSTICA'
        });
      } else if (f.id === '21987') {
        list.push({
          id: 'COT-21987-1',
          freteId: f.id,
          aglutinadorId: f.aglutinadorId,
          cliente: f.cliente,
          dataInicioJanela: f.dataInicioJanela,
          dataFimJanela: f.dataFimJanela,
          dataNecessidadeEntrega: f.dataNecessidadeEntrega,
          fluxo: f.fluxo,
          solicitante: f.solicitante,
          status: 'Em Análise',
          transportador: 'M3 LOGÍSTICA'
        });
        list.push({
          id: 'COT-21987-2',
          freteId: f.id,
          aglutinadorId: f.aglutinadorId,
          cliente: f.cliente,
          dataInicioJanela: f.dataInicioJanela,
          dataFimJanela: f.dataFimJanela,
          dataNecessidadeEntrega: f.dataNecessidadeEntrega,
          fluxo: f.fluxo,
          solicitante: f.solicitante,
          status: 'Reprovado',
          transportador: 'VF (IVOTI)'
        });
      } else if (f.id === '21990') {
        list.push({
          id: 'COT-21990-1',
          freteId: f.id,
          aglutinadorId: f.aglutinadorId,
          cliente: f.cliente,
          dataInicioJanela: f.dataInicioJanela,
          dataFimJanela: f.dataFimJanela,
          dataNecessidadeEntrega: f.dataNecessidadeEntrega,
          fluxo: f.fluxo,
          solicitante: f.solicitante,
          status: 'Aprovado',
          transportador: 'GOLDEN CARGO'
        });
        list.push({
          id: 'COT-21990-2',
          freteId: f.id,
          aglutinadorId: f.aglutinadorId,
          cliente: f.cliente,
          dataInicioJanela: f.dataInicioJanela,
          dataFimJanela: f.dataFimJanela,
          dataNecessidadeEntrega: f.dataNecessidadeEntrega,
          fluxo: f.fluxo,
          solicitante: f.solicitante,
          status: 'Cancelado',
          transportador: 'MIRASSOL'
        });
      } else {
        list.push({
          id: `COT-${f.id}-1`,
          freteId: f.id,
          aglutinadorId: f.aglutinadorId,
          cliente: f.cliente,
          dataInicioJanela: f.dataInicioJanela,
          dataFimJanela: f.dataFimJanela,
          dataNecessidadeEntrega: f.dataNecessidadeEntrega,
          fluxo: f.fluxo,
          solicitante: f.solicitante,
          status: 'Pendente',
          transportador: 'MIRASSOL'
        });
        list.push({
          id: `COT-${f.id}-2`,
          freteId: f.id,
          aglutinadorId: f.aglutinadorId,
          cliente: f.cliente,
          dataInicioJanela: f.dataInicioJanela,
          dataFimJanela: f.dataFimJanela,
          dataNecessidadeEntrega: f.dataNecessidadeEntrega,
          fluxo: f.fluxo,
          solicitante: f.solicitante,
          status: 'Expirada',
          transportador: 'GOLDEN CARGO'
        });
      }
    }
    return list;
  }

  ngOnInit() {
    this.dataSource.data = this.allCotacoes;
    this.aplicarFiltro();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  onUsuarioSearchChange(searchText: string) {
    this.usuarioSearch = searchText;
    if (searchText && searchText.length >= 3) {
      this.filteredUsuarios = this.usuariosList.filter(u => u.toLowerCase().includes(searchText.toLowerCase()));
    } else {
      this.filteredUsuarios = [...this.usuariosList];
    }
  }

  onUsuarioSelectOpen(isOpen: boolean) {
    if (!isOpen) {
      this.usuarioSearch = '';
      this.filteredUsuarios = [...this.usuariosList];
    }
  }

  aplicarFiltro() {
    let filtrados = this.allCotacoes;
    
    if (this.id) {
      filtrados = filtrados.filter(c => c.id.toLowerCase().includes(this.id.toLowerCase()) || c.freteId.toLowerCase().includes(this.id.toLowerCase()));
    }
    if (this.cliente) {
      filtrados = filtrados.filter(c => c.cliente.toLowerCase().includes(this.cliente.toLowerCase()));
    }
    if (this.fornecedor) {
      filtrados = filtrados.filter(c => {
        const parent = this.fretes().find(f => f.id === c.freteId);
        return parent ? parent.fornecedor.toLowerCase().includes(this.fornecedor.toLowerCase()) : false;
      });
    }
    if (this.transportador) {
      filtrados = filtrados.filter(c => c.transportador.toLowerCase().includes(this.transportador.toLowerCase()));
    }
    if (this.numeroPedido) {
      filtrados = filtrados.filter(c => {
        const parent = this.fretes().find(f => f.id === c.freteId);
        return parent ? parent.numeroPedido?.toLowerCase().includes(this.numeroPedido.toLowerCase()) : false;
      });
    }
    if (this.codigoColeta) {
      filtrados = filtrados.filter(c => {
        const parent = this.fretes().find(f => f.id === c.freteId);
        return parent ? parent.codigoColeta?.toLowerCase().includes(this.codigoColeta.toLowerCase()) : false;
      });
    }

    if (this.usuario && this.usuario !== 'Todos') {
      filtrados = filtrados.filter(c => c.solicitante.toLowerCase().includes(this.usuario.toLowerCase()));
    }

    if (this.etapas && this.etapas.length > 0 && !this.etapas.includes('Todos')) {
      filtrados = filtrados.filter(c => {
        const parent = this.fretes().find(f => f.id === c.freteId);
        return parent ? this.etapas.includes(parent.etapa) : false;
      });
    }

    if (this.statusSelecionados && this.statusSelecionados.length > 0 && !this.statusSelecionados.includes('Todos')) {
      filtrados = filtrados.filter(c => this.statusSelecionados.includes(c.status));
    }

    this.dataSource.data = filtrados;
  }

  editarFrete(id: string) {
    this.router.navigate(['/edicao', id]);
  }

  openSearchModal(type: 'cliente' | 'fornecedor' | 'transportador') {
    const titles = {
      cliente: 'Pesquisar Cliente',
      fornecedor: 'Pesquisar Fornecedor',
      transportador: 'Pesquisar Transportadora'
    };

    const dialogRef = this.dialog.open(SearchModal, {
      width: '1000px',
      maxWidth: '95vw',
      data: { title: titles[type], type }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (type === 'cliente') this.cliente = result;
        if (type === 'fornecedor') this.fornecedor = result;
        if (type === 'transportador') this.transportador = result;
      }
    });
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'Pendente': return 'badge-pendente';
      case 'Declinada': return 'badge-declinada';
      case 'Expirada': return 'badge-expirada';
      case 'Em Análise': return 'badge-em-analise';
      case 'Aprovado': return 'badge-aprovado';
      case 'Reprovado': return 'badge-reprovado';
      case 'Cancelado': return 'badge-cancelado';
      default: return 'badge-default';
    }
  }
}
