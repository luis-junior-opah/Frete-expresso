import { Component, Input, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { SelectionModel } from '@angular/cdk/collections';
import { SolicitacaoCard } from '../solicitacao-card/solicitacao-card';
import { Frete } from '../../../../core/models/frete.model';
import { FilterModal } from './filter-modal';
import { SearchModal } from '../../../acompanhamento-panel/components/search-modal/search-modal';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-observacao-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Observações do Frete</h2>
    <mat-dialog-content>
      <p style="white-space: pre-wrap; color: #334155; line-height: 1.5; min-width: 300px; padding-top: 8px;">{{ data || 'Nenhuma observação registrada para este frete.' }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `
})
export class ObservacaoModal {
  data = inject(MAT_DIALOG_DATA);
}

@Component({
  selector: 'app-agrupamento-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatSelectModule, FormsModule, MatFormFieldModule, MatIconModule, MatDividerModule],
  template: `
    <h2 mat-dialog-title style="font-weight: 800; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px;">Configurar Novo Agrupamento</h2>
    <mat-dialog-content style="min-width: 500px; overflow: visible !important;">
      <div style="padding-top: 16px; padding-bottom: 60px;">
        <p style="margin-bottom: 16px; color: #475569;">Você está consolidando <strong>{{ data.count }}</strong> demandas com o frete principal.</p>
        
        <!-- Métricas Consolidadas -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Peso Total</span>
            <span style="font-size: 1.1rem; font-weight: 800; color: #1e293b;">{{ data.metrics.peso }} kg</span>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Volumetria</span>
            <span style="font-size: 1.1rem; font-weight: 800; color: #1e293b;">{{ data.metrics.volumetria }} m³</span>
          </div>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">Peso Cubado</span>
            <span style="font-size: 1.1rem; font-weight: 800; color: #1e293b;">{{ data.metrics.pesoCubado | number:'1.2-2' }} kg</span>
          </div>
        </div>

        <!-- Alerta Aprimorado -->
        <div style="background-color: #fffbeb; border: 1px solid #fef08a; padding: 14px 16px; border-radius: 8px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; overflow: visible;">
          <mat-icon style="color: #ca8a04; width: 24px; height: 24px; flex-shrink: 0;">warning</mat-icon>
          <span style="color: #854d0e; font-size: 0.9rem; line-height: 1.2; font-weight: 600; white-space: nowrap;">
            Definição de veículo obrigatória para o agrupamento.
          </span>
        </div>
        
        <!-- Dropdown ao final -->
        <mat-form-field appearance="outline" style="width: 100%;">
          <mat-label>Selecione o Veículo para o Grupo</mat-label>
          <mat-select [(ngModel)]="selectedVehicle" required 
                      disableOptionCentering
                      panelClass="grouping-select-panel">
            <mat-option *ngFor="let type of data.vehicleTypes" [value]="type.value">
              {{ type.label }}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end" style="padding: 16px 24px; border-top: 1px solid #e2e8f0; background: white; position: sticky; bottom: 0; z-index: 10;">
      <button mat-button [mat-dialog-close]="null" style="font-weight: 400 !important; color: #64748b;">CANCELAR</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="selectedVehicle" [disabled]="!selectedVehicle" 
              style="font-weight: 400 !important; padding: 0 24px; height: 40px; border-radius: 8px;">
        CONFIRMAR E AGRUPAR
      </button>
    </mat-dialog-actions>
  `
})
export class AgrupamentoModal {
  data = inject(MAT_DIALOG_DATA);
  selectedVehicle = '';
}

interface DemandaAgrupavel {
  id: number;
  pedido: string;
  aglutinador: string;
  inicioJanela: string;
  fimJanela: string;
  localColeta: string;
  distancia: string;
  localEntrega: string;
  necessidadeEntrega: string;
  transportador: string;
  peso: number;
  volumetria: number;
  fornecedor: string;
  codUnidade: string;
  cliente: string;
  modal: string;
  tipoVeiculo: string;
  fluxo: string;
  tipoMaterial: string;
  altura: number;
  comprimento: number;
  largura: number;
  solicitante: string;
  dataCriacao: string;
  observacoes: string;
  grouped?: boolean;
}

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  permanent?: boolean;
}

@Component({
  selector: 'app-cotacao-step-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatCheckboxModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatRadioModule,
    SolicitacaoCard
  ],
  templateUrl: './cotacao-step-view.html',
  styleUrl: './cotacao-step-view.css',
})
export class CotacaoStepView implements OnInit {
  @Input() frete?: Frete;
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  observacao = '';
  logsAlteracao: any[] = [];
  aprovacaoRealizada = false;
  tipoAprovacao: 'individual' | 'agrupado' | 'simples' | null = null;
  idAprovado: number | null = null;

  private readonly complementarMetadata = { 
    id: 101,
    localColeta: 'Rua General Osório, 1200 - Centro, Ribeirão Preto - SP, 14010-000',
    dataInicio: '05/12/2023 - 08:00',
    dataFim: '10/12/2023 - 18:00',
    necessidade: '10/12/2023 - 20:00'
  };

  quotations = [
    {
      id: 1,
      status: 'Aprovado',
      transportadora: 'JM PREMIER',
      observacao: 'Cotação dentro do budget planejado para a rota.',
      temAnexo: true,
      showComplementar: true,
      individual: { ttColeta: 24, ttEntrega: 48, ttTotal: 72, valor: 8500, valorHistorico: 8000 },
      complementar: { 
        ...this.complementarMetadata,
        ttColeta: 12, ttEntrega: 24, ttTotal: 36, valor: 1200, valorHistorico: 1500 
      }
    },
    {
      id: 2,
      status: 'Em análise',
      transportadora: 'RAPIDÃO COMETA',
      observacao: 'Necessita validação de capacidade para o veículo solicitado.',
      temAnexo: false,
      showComplementar: true,
      individual: { ttColeta: 12, ttEntrega: 36, ttTotal: 48, valor: 9200, valorHistorico: 8500 },
      complementar: { 
        ...this.complementarMetadata,
        ttColeta: 8, ttEntrega: 16, ttTotal: 24, valor: 950, valorHistorico: 1000 
      }
    },
    {
      id: 3,
      status: 'Alerta - Contingência Administrativa',
      transportadora: 'BRASPRESS',
      observacao: 'Valor acima da média, porém com menor Transit Time.',
      temAnexo: true,
      showComplementar: true,
      individual: { ttColeta: 48, ttEntrega: 72, ttTotal: 120, valor: 7800, valorHistorico: 8000 },
      complementar: { 
        ...this.complementarMetadata,
        ttColeta: 24, ttEntrega: 48, ttTotal: 72, valor: 1500, valorHistorico: 1200 
      }
    }
  ];

  columnConfigs: ColumnConfig[] = [
    { key: 'select', label: 'Selecionar', visible: true, permanent: true },
    { key: 'id', label: 'ID', visible: true },
    { key: 'aglutinador', label: 'Aglutinador', visible: true },
    { key: 'pedido', label: 'Pedido', visible: true },
    { key: 'inicioJanela', label: 'Início Janela', visible: true },
    { key: 'fimJanela', label: 'Fim Janela', visible: true },
    { key: 'necessidadeEntrega', label: 'Necessidade de Entrega', visible: true },
    { key: 'localColeta', label: 'Local de Coleta', visible: true },
    { key: 'localEntrega', label: 'Local de Entrega', visible: true },
    { key: 'distancia', label: 'Distância', visible: true }
  ];

  get displayedColumns(): string[] {
    return this.columnConfigs
      .filter(col => col.visible)
      .map(col => col.key);
  }

  allDemands: DemandaAgrupavel[] = [
    {
      id: 101,
      pedido: '4500123460',
      aglutinador: 'AGL-105',
      inicioJanela: '16/06/2026 07:00',
      fimJanela: '16/06/2026 11:00',
      localColeta: 'FORNECEDOR ALFA S.A. - RUA DAS INDÚSTRIAS, 1500, DISTRITO INDUSTRIAL, SÃO PAULO - SP, CEP 04578-000',
      distancia: '12 km',
      localEntrega: 'CD CENTRAL LOGÍSTICA - AV. PRESIDENTE DUTRA, KM 210, BONSUCESSO, GUARULHOS - SP, CEP 07170-350',
      necessidadeEntrega: '16/06/2026 14:00',
      transportador: 'EXPRESSO SÃO PAULO',
      peso: 1500,
      volumetria: 8.5,
      fornecedor: 'FORNECEDOR ALFA S.A.',
      codUnidade: '3Q00',
      cliente: 'CLIENTE X',
      modal: 'Rodoviário',
      tipoVeiculo: 'Truck Aberto',
      fluxo: 'Fabrica',
      tipoMaterial: 'Direto',
      altura: 1.5,
      comprimento: 2.0,
      largura: 1.2,
      solicitante: 'João Silva',
      dataCriacao: '15/06/2026 10:30',
      observacoes: 'Urgência na entrega'
    },
    {
      id: 102,
      pedido: '4500123461',
      aglutinador: '',
      inicioJanela: '16/06/2026 08:30',
      fimJanela: '16/06/2026 12:30',
      localColeta: 'METALÚRGICA LAPA LTDA - RUA GUAICURUS, 450, LAPA, SÃO PAULO - SP, CEP 05033-001',
      distancia: '18 km',
      localEntrega: 'CD CENTRAL LOGÍSTICA - AV. PRESIDENTE DUTRA, KM 210, BONSUCESSO, GUARULHOS - SP, CEP 07170-350',
      necessidadeEntrega: '16/06/2026 15:30',
      transportador: 'LOG TRANS',
      peso: 2200,
      volumetria: 12.0,
      fornecedor: 'METALÚRGICA LAPA LTDA',
      codUnidade: 'BM00',
      cliente: 'CLIENTE Y',
      modal: 'Rodoviário',
      tipoVeiculo: 'Truck Aberto',
      fluxo: 'Fornecedor',
      tipoMaterial: 'Embalagem',
      altura: 1.0,
      comprimento: 1.5,
      largura: 1.0,
      solicitante: 'Maria Oliveira',
      dataCriacao: '15/06/2026 11:45',
      observacoes: '-'
    },
    {
      id: 103,
      pedido: '4500123462',
      aglutinador: 'AGL-202',
      inicioJanela: '16/06/2026 09:00',
      fimJanela: '16/06/2026 13:00',
      localColeta: 'ESTAMPARIA ABC - AV. PEREIRA BARRETO, 1200, BAETA NEVES, SÃO BERNARDO DO CAMPO - SP, CEP 09751-000',
      distancia: '25 km',
      localEntrega: 'CD CENTRAL LOGÍSTICA - AV. PRESIDENTE DUTRA, KM 210, BONSUCESSO, GUARULHOS - SP, CEP 07170-350',
      necessidadeEntrega: '16/06/2026 16:00',
      transportador: 'ABC TRANSPORTES',
      peso: 850,
      volumetria: 4.2,
      fornecedor: 'ESTAMPARIA ABC',
      codUnidade: 'BZ00',
      cliente: 'CLIENTE Z',
      modal: 'Rodoviário',
      tipoVeiculo: '3/4 Aberto',
      fluxo: 'Fabrica',
      tipoMaterial: 'Indireto',
      altura: 0.8,
      comprimento: 1.2,
      largura: 0.8,
      solicitante: 'Pedro Santos',
      dataCriacao: '15/06/2026 14:20',
      observacoes: 'Fragil'
    }
  ];

  dataSource: DemandaAgrupavel[] = [];
  groupedDemands: DemandaAgrupavel[] = [];
  aglutinadosColumns: string[] = [
    'ag_select', 'ag_id', 'ag_pedido', 'ag_fornecedor', 'ag_localColeta', 
    'ag_distancia', 'ag_inicioJanela', 'ag_fimJanela', 
    'ag_necessidadeEntrega', 'ag_modal', 'ag_tipoVeiculo', 'ag_fluxo', 
    'ag_tipoMaterial', 'ag_altura', 'ag_comprimento', 'ag_largura', 'ag_peso', 
    'ag_volumetria', 'ag_solicitante', 'ag_dataCriacao', 'ag_observacoes'
  ];
  aglutinadosTipoVeiculo = 'Truck Aberto';
  aglutinadosPeso = 12500;
  aglutinadosVolumetria = 42;
  aglutinadosPesoCubado = 0;

  get aglutinadorAtual(): string {
    return this.groupedDemands.length > 0 ? this.groupedDemands[0].aglutinador : '';
  }

  get codUnidadeAtual(): string {
    return this.groupedDemands.length > 0 ? this.groupedDemands[0].codUnidade : '';
  }

  get clienteAtual(): string {
    return this.groupedDemands.length > 0 ? this.groupedDemands[0].cliente : '';
  }

  get localEntregaAtual(): string {
    return this.groupedDemands.length > 0 ? this.groupedDemands[0].localEntrega : '';
  }

  vehicleTypes = [
    { value: 'Aéreo', label: 'Aéreo - Capacidade máx: 999999.0 Kgs - 94.5 m³' },
    { value: 'Truck Aberto', label: 'Truck Aberto - Capacidade máx: 12000.0 Kgs - 50.63 m³' },
    { value: '3/4 Aberto', label: '3/4 Aberto - Capacidade máx: 3000.0 Kgs - 20.0 m³' },
    { value: 'Carreta Bau', label: 'Carreta Bau - Capacidade máx: 25000.0 Kgs - 94.5 m³' },
    { value: 'Carreta Vanderleia', label: 'Carreta Vanderleia - Capacidade máx: 34000.0 Kgs - 94.5 m³' },
    { value: 'Utilitario', label: 'Utilitario - Capacidade máx: 500.0 Kgs - 2.85 m³' },
    { value: 'Van', label: 'Van - Capacidade máx: 1500.0 Kgs - 9.03 m³' },
    { value: '3/4', label: '3/4 - Capacidade máx: 3000.0 Kgs - 20.0 m³' },
    { value: 'Toco', label: 'Toco - Capacidade máx: 6000.0 Kgs - 46.38 m³' },
    { value: 'Truck Sider', label: 'Truck Sider - Capacidade máx: 12000.0 Kgs - 50.63 m³' },
    { value: 'Carreta Sider', label: 'Carreta Sider - Capacidade máx: 25000.0 Kgs - 94.5 m³' },
    { value: 'Rodotrem Sider', label: 'Rodotrem Sider - Capacidade máx: 45000.0 Kgs - 168.75 m³' },
    { value: 'Carreta Aberta', label: 'Carreta Aberta - Capacidade máx: 25000.0 Kgs - 94.5 m³' },
    { value: 'Rodotrem Light', label: 'Rodotrem Light - Capacidade máx: 22000.0 Kgs - 189.0 m³' },
    { value: 'Truck Van', label: 'Truck Van - Capacidade máx: 25000.0 Kgs - 94.5 m³' },
    { value: 'Truck Bau', label: 'Truck Bau - Capacidade máx: 12000.0 Kgs - 50.63 m³' },
    { value: 'Rodotrem Bau', label: 'Rodotrem Bau - Capacidade máx: 22000.0 Kgs - 189.0 m³' }
  ];
  
  selection = new SelectionModel<DemandaAgrupavel>(true, []);
  currentFilters: any = {};

  ngOnInit(): void {
    if (this.frete) {
      this.aglutinadosTipoVeiculo = this.frete.tipoVeiculo || 'Truck Aberto';
      this.aglutinadosPeso = this.frete.peso || 0;
      this.aglutinadosVolumetria = this.frete.volumetria || 0;
    }
    this.dataSource = [...this.allDemands].sort((a, b) => {
      const distA = parseInt(a.distancia);
      const distB = parseInt(b.distancia);
      return distA - distB;
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource);
  }

  checkboxLabel(row?: DemandaAgrupavel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
  }

  agrupar() {
    const selecionados = this.selection.selected;
    if (selecionados.length === 0) return;

    // Cálculo das métricas para o modal
    const metrics = {
      peso: selecionados.reduce((sum, item) => sum + (item.peso || 0), 0),
      volumetria: selecionados.reduce((sum, item) => sum + (item.volumetria || 0), 0),
      pesoCubado: selecionados.reduce((sum, item) => {
        const h = item.altura || 0;
        const l = item.largura || 0;
        const c = item.comprimento || 0;
        return sum + ((h * l * c) * 300);
      }, 0)
    };

    // Se o frete principal ainda não estiver no grupo, adiciona suas métricas
    if (this.groupedDemands.length === 0 && this.frete) {
      metrics.peso += (this.frete.peso || 0);
      metrics.volumetria += (this.frete.volumetria || 0);
      const h = this.frete.altura || 0;
      const l = this.frete.largura || 0;
      const c = this.frete.comprimento || 0;
      metrics.pesoCubado += ((h * l * c) * 300);
    }

    const dialogRef = this.dialog.open(AgrupamentoModal, {
      width: '550px',
      disableClose: true,
      data: {
        count: selecionados.length,
        vehicleTypes: this.vehicleTypes,
        metrics: metrics
      }
    });

    dialogRef.afterClosed().subscribe(veiculoSelecionado => {
      if (veiculoSelecionado) {
        let updatedGrouped = [...this.groupedDemands];
        
        if (updatedGrouped.length === 0 && this.frete) {
          updatedGrouped.push(this.mapFreteToDemanda(this.frete));
        }

        this.aglutinadosTipoVeiculo = veiculoSelecionado;

        selecionados.forEach(item => item.grouped = true);
        this.groupedDemands = [...updatedGrouped, ...selecionados];
        this.dataSource = this.dataSource.filter(item => !selecionados.includes(item));
        this.selection.clear();
        this.calcularTotaisAglutinados();
        
        this.registrarLog('Agrupamento realizado', 
          `${selecionados.length} demandas agrupadas. Veículo definido: ${veiculoSelecionado}`);
        
        this.cdr.detectChanges();

        this.snackBar.open('Agrupamento realizado com sucesso!', 'OK', {
          duration: 4000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  private mapFreteToDemanda(frete: Frete): DemandaAgrupavel {
    return {
      id: Number(frete.id) || 999,
      pedido: frete.numeroPedido || '4500123999',
      aglutinador: frete.aglutinadorId || 'AGL-BASE',
      inicioJanela: frete.dataInicioJanela,
      fimJanela: frete.dataFimJanela,
      localColeta: frete.enderecoColeta,
      distancia: `${frete.distancia || 0} km`,
      localEntrega: frete.enderecoEntrega,
      necessidadeEntrega: frete.dataNecessidadeEntrega,
      transportador: frete.transportador,
      peso: frete.peso || 0,
      volumetria: frete.volumetria || 0,
      fornecedor: frete.fornecedor || 'FORNECEDOR PADRÃO',
      codUnidade: frete.unitCD || 'UNID',
      cliente: frete.cliente || 'CLIENTE PADRÃO',
      modal: frete.modal || 'Rodoviário',
      tipoVeiculo: frete.tipoVeiculo || 'Truck Aberto',
      fluxo: frete.fluxo || 'Fabrica',
      tipoMaterial: frete.tipoMaterial || 'Direto',
      altura: frete.altura || 0,
      comprimento: frete.comprimento || 0,
      largura: frete.largura || 0,
      solicitante: frete.solicitante || 'Usuário Padrão',
      dataCriacao: frete.dataCriacao || '16/06/2026 08:00',
      observacoes: frete.observacoes || '-',
      grouped: true
    };
  }

  private calcularTotaisAglutinados() {
    if (this.groupedDemands.length > 0) {
      this.aglutinadosPeso = this.groupedDemands.reduce((sum, item) => sum + (item.peso || 0), 0);
      this.aglutinadosVolumetria = this.groupedDemands.reduce((sum, item) => sum + (item.volumetria || 0), 0);
      this.aglutinadosPesoCubado = this.groupedDemands.reduce((sum, item) => {
        const h = item.altura || 0;
        const l = item.largura || 0;
        const c = item.comprimento || 0;
        return sum + ((h * l * c) * 300);
      }, 0);
    } else {
      this.aglutinadosPesoCubado = 0;
    }
  }

  desagrupar(row: DemandaAgrupavel) {
    const isMainFreight = this.frete && Number(this.frete.id) === row.id;

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Confirmar Desagrupamento',
        message: isMainFreight 
          ? 'Deseja realmente dissolver todo o agrupamento? O frete principal voltará ao estado individual.' 
          : `Deseja realmente remover o agrupamento do pedido ${row.pedido}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (isMainFreight) {
          const itemsToReturn = this.groupedDemands.filter(item => item.id !== row.id);
          itemsToReturn.forEach(item => item.grouped = false);
          this.dataSource = [...this.dataSource, ...itemsToReturn].sort((a, b) => {
            return parseInt(a.distancia) - parseInt(b.distancia);
          });
          this.groupedDemands = [];
          this.registrarLog('Desagrupamento total', `O agrupamento foi dissolvido a partir do frete principal`);
        } else {
          row.grouped = false;
          this.dataSource = [...this.dataSource, row].sort((a, b) => {
            const distA = parseInt(a.distancia);
            const distB = parseInt(b.distancia);
            return distA - distB;
          });
          this.groupedDemands = this.groupedDemands.filter(item => item.id !== row.id);
          
          if (this.groupedDemands.length === 1) {
            this.groupedDemands = [];
            this.registrarLog('Desagrupamento automático', `Agrupamento encerrado por falta de itens adicionais`);
          } else {
            this.calcularTotaisAglutinados();
            this.registrarLog('Desagrupamento de demanda', `Pedido ${row.pedido} removido do agrupamento`);
          }
        }
        this.cdr.detectChanges();
      }
    });
  }

  confirmarSalvamentoAglutinados() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Confirmar Alterações',
        message: 'Deseja salvar as alterações de veículo, peso e volumetria do agrupamento?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.salvarAlteracoesAglutinados();
      }
    });
  }

  salvarAlteracoesAglutinados() {
    if (!this.aglutinadosTipoVeiculo) {
      this.snackBar.open('O campo "Tipo de veículo" deve ser atualizado obrigatoriamente para salvar o agrupamento.', 'Fechar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.registrarLog('Alterações de Agrupamento Salvas', 
      `Veículo: ${this.aglutinadosTipoVeiculo}, Peso: ${this.aglutinadosPeso}kg, Volumetria: ${this.aglutinadosVolumetria}m³`);
    
    this.snackBar.open('Alterações do agrupamento salvas com sucesso!', 'Fechar', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  abrirObservacao(obs: string) {
    if (!obs || obs === '-') return;
    this.dialog.open(ObservacaoModal, {
      data: obs,
      width: '500px'
    });
  }

  getDuploCheck(valor: number, historico: number) {
    if (!historico) return { status: 'none', message: '' };
    
    const margemTolerancia = 10;
    const diffPercent = ((valor - historico) / historico) * 100;
    const isOverMargin = diffPercent > margemTolerancia;

    return {
      status: isOverMargin ? 'danger' : 'info',
      message: `Duplo check: valor cotado ${Math.abs(diffPercent).toFixed(1)}% ${diffPercent > 0 ? 'acima' : 'abaixo'} do histórico de fretes com as mesmas caracteristicas.`
    };
  }

  showCheckMessage(message: string) {
    this.snackBar.open(message, 'OK', {
      duration: 5000,
      panelClass: ['info-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  openFilterModal() {
    const dialogRef = this.dialog.open(FilterModal, {
      width: '600px',
      data: this.currentFilters
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.currentFilters = result;
        this.applyFilters(result);
      }
    });
  }

  applyFilters(filters: any) {
    this.dataSource = this.allDemands.filter(item => {
      let match = true;
      if (filters.pedido && !item.pedido.includes(filters.pedido)) match = false;
      if (filters.aglutinador && !item.aglutinador.includes(filters.aglutinador)) match = false;
      if (filters.transportadora && item.transportador !== filters.transportadora) match = false;
      if (filters.localColeta && !item.localColeta.includes(filters.localColeta)) match = false;
      
      const distValue = parseInt(item.distancia);
      if (distValue > (filters.distancia || 150)) match = false;

      if (filters.dataInicio && !item.inicioJanela.startsWith(this.formatDate(filters.dataInicio))) match = false;
      if (filters.dataFim && !item.fimJanela.startsWith(this.formatDate(filters.dataFim))) match = false;
      if (filters.dataNecessidade && !item.necessidadeEntrega.startsWith(this.formatDate(filters.dataNecessidade))) match = false;

      return match;
    });

    this.dataSource.sort((a, b) => {
      const distA = parseInt(a.distancia);
      const distB = parseInt(b.distancia);
      return distA - distB;
    });
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  toggleColumn(config: ColumnConfig) {
    if (config.permanent) return;
    config.visible = !config.visible;
  }

  reabrirCotacao(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Reabrir Cotação',
        message: 'Você deseja reabrir a cotação por mais 30 minutos?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        const quotation = this.quotations.find(q => q.id === id);
        const transportador = quotation?.transportadora || '';
        
        this.quotations = this.quotations.map(q => 
          q.id === id ? { ...q, status: 'Pendente' } : q
        );
        this.registrarLog('Reabertura de cotação', `Cotação #${id} para ${transportador} reaberta por mais 30 minutos`);
      }
    });
  }

  cancelarCotacao(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Cancelar Cotação',
        message: `Deseja realmente cancelar a cotação #${id}? Esta ação não pode ser desfeita.`
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm === true) {
        const quotation = this.quotations.find(q => q.id === id);
        const transportador = quotation?.transportadora || '';

        this.quotations = this.quotations.map(q => 
          q.id === id ? { ...q, status: 'Cancelado' } : q
        );
        this.registrarLog('Cancelamento de cotação', `Cotação #${id} do transportador ${transportador} foi cancelada`);
      }
    });
  }

  enviarCotacao() {
    const dialogRef = this.dialog.open(SearchModal, {
      width: '1000px',
      maxWidth: '95vw',
      data: { title: 'Pesquisar Transportadora', type: 'transportador' }
    });

    dialogRef.afterClosed().subscribe(transportador => {
      if (transportador) {
        const confirmRef = this.dialog.open(ConfirmDialog, {
          width: '400px',
          data: {
            title: 'Confirmar Envio',
            message: `Deseja enviar a solicitação de cotação para o transportador ${transportador}?`
          }
        });

        confirmRef.afterClosed().subscribe(confirm => {
          if (confirm === true) {
            const nextId = (this.quotations.length > 0 ? Math.max(...this.quotations.map(q => q.id)) : 0) + 1;
            const newQuotation = {
              id: nextId,
              status: 'Pendente',
              transportadora: transportador,
              observacao: '-',
              temAnexo: false,
              showComplementar: true,
              individual: { ttColeta: 0, ttEntrega: 0, ttTotal: 0, valor: 0, valorHistorico: 0 },
              complementar: { 
                ...this.complementarMetadata,
                ttColeta: 0, 
                ttEntrega: 0, 
                ttTotal: 0, 
                valor: 0,
                valorHistorico: 0
              }
            };
            
            this.quotations = [...this.quotations, newQuotation];
            this.registrarLog('Nova cotação enviada', `Solicitação de cotação #${nextId} enviada para ${transportador}`);
          }
        });
      }
    });
  }

  private registrarLog(acao: string, detalhes: string = '') {
    const now = new Date();
    const log = {
      data: now.toLocaleDateString('pt-BR'),
      hora: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      usuario: 'usuario.logado@empresa.com',
      acao: acao,
      detalhes: detalhes
    };
    this.logsAlteracao = [log, ...this.logsAlteracao];
  }

  onAglutinadosChange(field: string, value: any) {
    this.registrarLog('Alteração dados agrupamento', `${field} alterado para: ${value}`);
  }
}
