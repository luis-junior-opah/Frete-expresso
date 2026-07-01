import { Component, inject, OnInit, ViewChild, signal, computed, effect } from '@angular/core';
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
import { Frete, FreteStatus } from '../../core/models/frete.model';
import { SearchModal } from './components/search-modal/search-modal';

@Component({
  selector: 'app-acompanhamento-panel',
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
  templateUrl: './acompanhamento-panel.html',
  styleUrls: ['./acompanhamento-panel.css']
})
export class AcompanhamentoPanel implements OnInit {
  private freteService = inject(FreteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);

  fretes = this.freteService.fretes;
  dataSource = new MatTableDataSource<Frete>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  displayedColumns: string[] = ['id', 'aglutinadorId', 'numeroPedido', 'codigoColeta', 'cliente', 'fornecedor', 'transportador', 'dataInicioJanela', 'dataFimJanela', 'dataNecessidadeEntrega', 'fluxo', 'solicitante', 'etapa', 'status', 'acoes'];

  titulo = 'Gestão Fretes Expressos';
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
    // Moved logic to ngOnInit and manual updates
  }

  toggleFilters() {
    this.showFilters.update(v => !v);
  }

  ngOnInit() {
    // Manual subscription to signal for data source
    this.dataSource.data = this.fretes();
    this.aplicarFiltro();

    // Mock: Simular expiração de SLA da matriz de alçadas (Contingência Adm)
    setInterval(() => {
      let changed = false;
      const currentFretes = this.freteService.fretes();
      const updatedFretes = currentFretes.map(f => {
        if (f.id === '21987' && f.status === 'Em Aprovação' && Math.random() > 0.8) {
          changed = true;
          return { ...f, status: 'Alerta - Contingência Administrativa' as FreteStatus };
        }
        return f;
      });
      if (changed) {
        this.freteService.fretes.set(updatedFretes);
        this.aplicarFiltro();
      }
    }, 15000);
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
    let filtrados = this.fretes();
    
    if (this.id) filtrados = filtrados.filter(f => f.id.includes(this.id));
    if (this.cliente) filtrados = filtrados.filter(f => f.cliente.toLowerCase().includes(this.cliente.toLowerCase()));
    if (this.fornecedor) filtrados = filtrados.filter(f => f.fornecedor.toLowerCase().includes(this.fornecedor.toLowerCase()));
    if (this.transportador) filtrados = filtrados.filter(f => f.transportador.toLowerCase().includes(this.transportador.toLowerCase()));
    if (this.numeroPedido) filtrados = filtrados.filter(f => f.numeroPedido?.toLowerCase().includes(this.numeroPedido.toLowerCase()));
    if (this.codigoColeta) filtrados = filtrados.filter(f => f.codigoColeta?.toLowerCase().includes(this.codigoColeta.toLowerCase()));
    
    if (this.usuario && this.usuario !== 'Todos') {
      filtrados = filtrados.filter(f => f.solicitante.toLowerCase().includes(this.usuario.toLowerCase()));
    }

    if (this.etapas && this.etapas.length > 0 && !this.etapas.includes('Todos')) {
      filtrados = filtrados.filter(f => this.etapas.includes(f.etapa));
    }

    if (this.statusSelecionados && this.statusSelecionados.length > 0 && !this.statusSelecionados.includes('Todos')) {
      filtrados = filtrados.filter(f => this.statusSelecionados.includes(f.status));
    }

    this.dataSource.data = filtrados;
  }

  voltar() {
    this.router.navigate(['/home']);
  }

  novaSolicitacao() {
    this.router.navigate(['/solicitacao']);
  }

  cotacoes() {
    this.router.navigate(['/cotacoes']);
  }

  configuracoes() {
    this.router.navigate(['/configuracoes']);
  }

  editarFrete(id: string) {
    this.router.navigate(['/solicitacao', id]);
  }

  verHistorico(id: string) {
    this.router.navigate(['/historico', id]);
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
      case 'Em Andamento': return 'badge-em-andamento';
      case 'Em Aprovação': return 'badge-em-aprovacao';
      case 'Aprovado': return 'badge-aprovado';
      case 'Aprovado Edição': return 'badge-aprovado-edicao';
      case 'Alerta - Contingência Administrativa': return 'badge-contingencia';
      case 'Cancelado': return 'badge-cancelado';
      case 'Finalizado': return 'badge-finalizado';
      default: return 'badge-default';
    }
  }

  getEtapaColor(etapa: string): string {
    // Only text now, but keeping function structure if ever needed again
    return '#455a64';
  }
}

