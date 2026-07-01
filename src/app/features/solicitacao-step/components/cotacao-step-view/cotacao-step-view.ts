import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
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
            <mat-option *ngFor="let type of data.vehicleTypes" 
                        [value]="type.value"
                        [disabled]="type.volumetria < (+data.metrics.volumetria)">
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
export class CotacaoStepView implements OnInit, OnDestroy {
  @Input() frete?: Frete;
  @Output() requestAdvance = new EventEmitter<void>();
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  observacao = '';
  logsAlteracao: any[] = [];
  aprovacaoRealizada = false;
  tipoAprovacao: 'individual' | 'agrupado' | 'simples' | null = null;
  idAprovado: number | null = null;

  private readonly complementarMetadata1 = { 
    id: 101,
    localColeta: 'Rua General Osório, 1200 - Centro, Ribeirão Preto - SP, 14010-000',
    dataInicio: '05/12/2023 - 08:00',
    dataFim: '10/12/2023 - 18:00',
    necessidade: '10/12/2023 - 20:00'
  };

  private readonly complementarMetadata2 = { 
    id: 102,
    localColeta: 'Rua Guaicurus, 450, Lapa, São Paulo - SP, 05033-001',
    dataInicio: '06/12/2023 - 08:00',
    dataFim: '11/12/2023 - 18:00',
    necessidade: '11/12/2023 - 20:00'
  };

  private readonly complementarMetadata3 = { 
    id: 103,
    localColeta: 'LTM (BOTUCATU) - AV. PEREIRA BARRETO, 1200, BAETA NEVES, SÃO BERNARDO DO CAMPO - SP, CEP 09751-000',
    dataInicio: '16/06/2026 - 09:00',
    dataFim: '16/06/2026 - 13:00',
    necessidade: '16/06/2026 - 16:00'
  };

  quotations = [
    {
      id: 1,
      status: 'Aprovado',
      transportadora: 'MIRASSOL',
      observacao: 'Cotação dentro do budget planejado para a rota.',
      temAnexo: true,
      showComplementar: true,
      slaRestante: 40 * 60,
      individual: { ttColeta: 24, ttEntrega: 48, ttTotal: 72, valor: 8500, valorHistorico: 8000 },
      complementares: [
        { ...this.complementarMetadata1, ttColeta: 12, ttEntrega: 24, ttTotal: 36, valor: 1200, valorHistorico: 1500 },
        { ...this.complementarMetadata2, ttColeta: 8, ttEntrega: 16, ttTotal: 24, valor: 800, valorHistorico: 900 },
        { ...this.complementarMetadata3, ttColeta: 10, ttEntrega: 20, ttTotal: 30, valor: 1000, valorHistorico: 1100 }
      ]
    },
    {
      id: 2,
      status: 'Pendente',
      transportadora: 'M3 LOGÍSTICA',
      observacao: 'Necessita validação de capacidade para o veículo solicitado.',
      temAnexo: false,
      showComplementar: true,
      slaRestante: 40 * 60,
      individual: { ttColeta: 12, ttEntrega: 36, ttTotal: 48, valor: 9200, valorHistorico: 8500 },
      complementares: [
        { ...this.complementarMetadata1, ttColeta: 8, ttEntrega: 16, ttTotal: 24, valor: 950, valorHistorico: 1000 },
        { ...this.complementarMetadata2, ttColeta: 6, ttEntrega: 12, ttTotal: 18, valor: 750, valorHistorico: 800 },
        { ...this.complementarMetadata3, ttColeta: 6, ttEntrega: 14, ttTotal: 20, valor: 900, valorHistorico: 950 }
      ]
    },
    {
      id: 3,
      status: 'Em Análise',
      transportadora: 'GOLDEN CARGO',
      observacao: 'Valor acima da média, porém com menor Transit Time.',
      temAnexo: true,
      showComplementar: true,
      slaRestante: 40 * 60,
      individual: { ttColeta: 48, ttEntrega: 72, ttTotal: 120, valor: 7800, valorHistorico: 8000 },
      complementares: [
        { ...this.complementarMetadata1, ttColeta: 24, ttEntrega: 48, ttTotal: 72, valor: 1500, valorHistorico: 1200 },
        { ...this.complementarMetadata2, ttColeta: 12, ttEntrega: 24, ttTotal: 36, valor: 1100, valorHistorico: 1000 },
        { ...this.complementarMetadata3, ttColeta: 14, ttEntrega: 28, ttTotal: 42, valor: 1200, valorHistorico: 1100 }
      ]
    }
  ];

  getFilteredComplementares(q: any): any[] {
    if (!q || !q.complementares) return [];
    return q.complementares.filter((c: any) => 
      this.groupedDemands.some(g => g.id === c.id)
    );
  }

  getComplementaresIds(q: any): string {
    return this.getFilteredComplementares(q).map((c: any) => `#${c.id}`).join(', ');
  }

  getTotals(q: any): any {
    let ttColeta = q.individual.ttColeta;
    let ttEntrega = q.individual.ttEntrega;
    let ttTotal = q.individual.ttTotal;
    let valor = q.individual.valor;
    let valorHistorico = q.individual.valorHistorico;

    this.getFilteredComplementares(q).forEach((c: any) => {
      ttColeta += c.ttColeta;
      ttEntrega += c.ttEntrega;
      ttTotal += c.ttTotal;
      valor += c.valor;
      valorHistorico += c.valorHistorico;
    });

    return { ttColeta, ttEntrega, ttTotal, valor, valorHistorico };
  }

  getAdicionais(q: any): any {
    let ttColeta = 0;
    let ttEntrega = 0;
    let ttTotal = 0;
    let valor = 0;
    let valorHistorico = 0;

    this.getFilteredComplementares(q).forEach((c: any) => {
      ttColeta += c.ttColeta;
      ttEntrega += c.ttEntrega;
      ttTotal += c.ttTotal;
      valor += c.valor;
      valorHistorico += c.valorHistorico;
    });

    return { ttColeta, ttEntrega, ttTotal, valor, valorHistorico };
  }

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
      localColeta: 'BRUNING (PANAMBI) - RUA DAS INDÚSTRIAS, 1500, DISTRITO INDUSTRIAL, SÃO PAULO - SP, CEP 04578-000',
      distancia: '12 km',
      localEntrega: 'CD CENTRAL LOGÍSTICA - AV. PRESIDENTE DUTRA, KM 210, BONSUCESSO, GUARULHOS - SP, CEP 07170-350',
      necessidadeEntrega: '16/06/2026 14:00',
      transportador: 'MIRASSOL',
      peso: 1500,
      volumetria: 8.5,
      fornecedor: 'BRUNING (PANAMBI)',
      codUnidade: '3Q00',
      cliente: 'JOHN DEERE CAMPINAS (3Q00)',
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
      localColeta: 'FOTOGRAVURA ZEYANA (CAXIAS) - RUA GUAICURUS, 450, LAPA, SÃO PAULO - SP, CEP 05033-001',
      distancia: '18 km',
      localEntrega: 'CD CENTRAL LOGÍSTICA - AV. PRESIDENTE DUTRA, KM 210, BONSUCESSO, GUARULHOS - SP, CEP 07170-350',
      necessidadeEntrega: '16/06/2026 15:30',
      transportador: 'M3 LOGÍSTICA',
      peso: 2200,
      volumetria: 12.0,
      fornecedor: 'FOTOGRAVURA ZEYANA (CAXIAS)',
      codUnidade: 'BM00',
      cliente: 'JOHN DEERE MONTENEGRO (BM00)',
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
      localColeta: 'LTM (BOTUCATU) - AV. PEREIRA BARRETO, 1200, BAETA NEVES, SÃO BERNARDO DO CAMPO - SP, CEP 09751-000',
      distancia: '25 km',
      localEntrega: 'CD CENTRAL LOGÍSTICA - AV. PRESIDENTE DUTRA, KM 210, BONSUCESSO, GUARULHOS - SP, CEP 07170-350',
      necessidadeEntrega: '16/06/2026 16:00',
      transportador: 'GOLDEN CARGO',
      peso: 850,
      volumetria: 4.2,
      fornecedor: 'LTM (BOTUCATU)',
      codUnidade: 'BZ00',
      cliente: 'JOHN DEERE INDAIATUBA (BZ00)',
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
  @Input() groupedDemands: DemandaAgrupavel[] = [];
  @Output() groupedDemandsChange = new EventEmitter<DemandaAgrupavel[]>();
  aglutinadosColumns: string[] = [
    'ag_select', 'ag_id', 'ag_pedido', 'ag_fornecedor', 'ag_localColeta', 
    'ag_distancia', 'ag_inicioJanela', 'ag_fimJanela', 
    'ag_necessidadeEntrega', 'ag_modal', 'ag_tipoVeiculo', 'ag_fluxo', 
    'ag_tipoMaterial', 'ag_altura', 'ag_comprimento', 'ag_largura', 'ag_peso', 
    'ag_volumetria', 'ag_solicitante', 'ag_dataCriacao', 'ag_observacoes'
  ];
  @Input() aglutinadosTipoVeiculo = 'Truck Aberto';
  @Output() aglutinadosTipoVeiculoChange = new EventEmitter<string>();
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
    { value: 'Aéreo', label: 'Aéreo - Capacidade máx: 999999.0 Kgs - 94.5 m³', volumetria: 94.5 },
    { value: 'Truck Aberto', label: 'Truck Aberto - Capacidade máx: 12000.0 Kgs - 50.63 m³', volumetria: 50.63 },
    { value: '3/4 Aberto', label: '3/4 Aberto - Capacidade máx: 3000.0 Kgs - 20.0 m³', volumetria: 20.0 },
    { value: 'Carreta Bau', label: 'Carreta Bau - Capacidade máx: 25000.0 Kgs - 94.5 m³', volumetria: 94.5 },
    { value: 'Carreta Vanderleia', label: 'Carreta Vanderleia - Capacidade máx: 34000.0 Kgs - 94.5 m³', volumetria: 94.5 },
    { value: 'Utilitario', label: 'Utilitario - Capacidade máx: 500.0 Kgs - 2.85 m³', volumetria: 2.85 },
    { value: 'Van', label: 'Van - Capacidade máx: 1500.0 Kgs - 9.03 m³', volumetria: 9.03 },
    { value: '3/4', label: '3/4 - Capacidade máx: 3000.0 Kgs - 20.0 m³', volumetria: 20.0 },
    { value: 'Toco', label: 'Toco - Capacidade máx: 6000.0 Kgs - 46.38 m³', volumetria: 46.38 },
    { value: 'Truck Sider', label: 'Truck Sider - Capacidade máx: 12000.0 Kgs - 50.63 m³', volumetria: 50.63 },
    { value: 'Carreta Sider', label: 'Carreta Sider - Capacidade máx: 25000.0 Kgs - 94.5 m³', volumetria: 94.5 },
    { value: 'Rodotrem Sider', label: 'Rodotrem Sider - Capacidade máx: 45000.0 Kgs - 168.75 m³', volumetria: 168.75 },
    { value: 'Carreta Aberta', label: 'Carreta Aberta - Capacidade máx: 25000.0 Kgs - 94.5 m³', volumetria: 94.5 },
    { value: 'Rodotrem Light', label: 'Rodotrem Light - Capacidade máx: 22000.0 Kgs - 189.0 m³', volumetria: 189.0 },
    { value: 'Truck Van', label: 'Truck Van - Capacidade máx: 25000.0 Kgs - 94.5 m³', volumetria: 94.5 },
    { value: 'Truck Bau', label: 'Truck Bau - Capacidade máx: 12000.0 Kgs - 50.63 m³', volumetria: 50.63 },
    { value: 'Rodotrem Bau', label: 'Rodotrem Bau - Capacidade máx: 22000.0 Kgs - 189.0 m³', volumetria: 189.0 }
  ];
  
  selection = new SelectionModel<DemandaAgrupavel>(true, []);
  currentFilters: any = {};

  timerSeconds = 40 * 60;
  timerInterval: any;
  rodada = 1;
  alertaConcorrenciaUnica = '';
  concorrenciaUnicaLiberada = false;

  get formattedTimer(): string {
    const minutes = Math.floor(this.timerSeconds / 60);
    const seconds = this.timerSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getFormattedTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  ngOnInit(): void {
    if (this.frete) {
      if (!this.aglutinadosTipoVeiculo) {
        this.aglutinadosTipoVeiculo = this.frete.tipoVeiculo || 'Truck Aberto';
      }
      this.aglutinadosPeso = this.frete.peso || 0;
      this.aglutinadosVolumetria = this.frete.volumetria || 0;
    }
    this.dataSource = this.allDemands
      .filter(d => !this.groupedDemands.some(g => g.id === d.id))
      .sort((a, b) => {
        const distA = parseInt(a.distancia);
        const distB = parseInt(b.distancia);
        return distA - distB;
      });
    this.calcularTotaisAglutinados();
    this.iniciarTimer();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
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
      peso: selecionados.reduce((sum, item) => sum + Number(item.peso || 0), 0),
      volumetria: selecionados.reduce((sum, item) => sum + Number(item.volumetria || 0), 0),
      pesoCubado: selecionados.reduce((sum, item) => {
        const h = item.altura || 0;
        const l = item.largura || 0;
        const c = item.comprimento || 0;
        return sum + ((h * l * c) * 300);
      }, 0)
    };

    // Se o frete principal ainda não estiver no grupo, adiciona suas métricas
    if (this.groupedDemands.length === 0 && this.frete) {
      metrics.peso += Number(this.frete.peso || 0);
      metrics.volumetria += Number(this.frete.volumetria || 0);
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
        this.notifyChanges();

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
      this.aglutinadosPeso = this.groupedDemands.reduce((sum, item) => sum + Number(item.peso || 0), 0);
      this.aglutinadosVolumetria = this.groupedDemands.reduce((sum, item) => sum + Number(item.volumetria || 0), 0);
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

  private notifyChanges() {
    this.groupedDemandsChange.emit(this.groupedDemands);
    this.aglutinadosTipoVeiculoChange.emit(this.aglutinadosTipoVeiculo);
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
        this.notifyChanges();
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

    const selectedVehicleObj = this.vehicleTypes.find(v => v.value === this.aglutinadosTipoVeiculo);
    if (selectedVehicleObj && selectedVehicleObj.volumetria < Number(this.aglutinadosVolumetria)) {
      this.snackBar.open(`O veículo selecionado (${this.aglutinadosTipoVeiculo}) não suporta a volumetria total de ${this.aglutinadosVolumetria} m³ (máx: ${selectedVehicleObj.volumetria} m³).`, 'Fechar', {
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
    this.notifyChanges();
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
              slaRestante: 40 * 60,
              individual: { ttColeta: 0, ttEntrega: 0, ttTotal: 0, valor: 0, valorHistorico: 0 },
              complementares: [
                { 
                  ...this.complementarMetadata1,
                  ttColeta: 0, 
                  ttEntrega: 0, 
                  ttTotal: 0, 
                  valor: 0,
                  valorHistorico: 0
                },
                { 
                  ...this.complementarMetadata2,
                  ttColeta: 0, 
                  ttEntrega: 0, 
                  ttTotal: 0, 
                  valor: 0,
                  valorHistorico: 0
                },
                { 
                  ...this.complementarMetadata3,
                  ttColeta: 0, 
                  ttEntrega: 0, 
                  ttTotal: 0, 
                  valor: 0,
                  valorHistorico: 0
                }
              ]
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

  iniciarTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      // Simulate commercial calendar check (pauses outside 07:00 to 20:00 or weekends)
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      const isWeekend = day === 0 || day === 6;
      const isCommercialHour = hour >= 7 && hour < 20;

      // Habilitar contagem incondicional para demonstração do protótipo (assim como no Step 3)
      if (true || (!isWeekend && isCommercialHour)) {
        // Decrement individual SLAs for pending quotations
        this.quotations.forEach(q => {
          if (q.status === 'Pendente' && q.slaRestante > 0) {
            q.slaRestante--;
          }
        });

        // Set global timerSeconds to the maximum/largest remaining SLA among pending quotations
        const pendingQuotations = this.quotations.filter(q => q.status === 'Pendente');
        if (pendingQuotations.length > 0) {
          this.timerSeconds = Math.max(...pendingQuotations.map(q => q.slaRestante || 0));
        } else {
          this.timerSeconds = 0;
        }

        if (this.timerSeconds <= 0) {
          this.lidarComExpiracaoSLA();
        }
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  lidarComExpiracaoSLA() {
    const submetidas = this.quotations.filter(q => q.status !== 'Pendente' && q.status !== 'Declinada' && q.status !== 'Expirada' && q.status !== 'Cancelado').length;
    
    if (submetidas >= 2) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.registrarLog('Avanço Automático', 'SLA expirado com 2 ou mais cotações válidas. Avançando automaticamente para aprovação.');
      this.snackBar.open('Avanço automático para Aprovação (2+ cotações recebidas).', 'OK', { duration: 3000 });
      this.requestAdvance.emit();
    } else {
      if (this.rodada === 1) {
        this.rodada = 2;
        this.quotations.forEach(q => {
          if (q.status === 'Expirada') {
            q.status = 'Pendente';
            q.slaRestante = 30 * 60;
          } else if (q.status === 'Pendente') {
            q.slaRestante = 30 * 60;
          }
        });
        this.timerSeconds = 30 * 60; // +30 min
        this.alertaConcorrenciaUnica = 'Prorrogação Automática: Menos de 2 propostas válidas recebidas. Prazo estendido por +30 min úteis e expiradas foram reabertas.';
        this.registrarLog('Prorrogação Automática', 'SLA expirado com concorrência única/nula. Prorrogado por +30 min úteis.');
        this.snackBar.open('Prorrogação automática ativada. Cotações expiradas foram reabertas.', 'OK', { duration: 5000 });
      } else {
        this.alertaConcorrenciaUnica = 'Atenção: Menos de 2 propostas na segunda rodada. Escolha a ação manual.';
        this.concorrenciaUnicaLiberada = true;
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        this.registrarLog('Prorrogação finalizada', 'Segunda rodada encerrada. Governança manual liberada.');
      }
    }
  }

  hasPendente(): boolean {
    return this.quotations.some(q => q.status === 'Pendente');
  }

  forcarEnvioAprovacao() {
    if (this.rodada === 1) {
      this.snackBar.open('O envio forçado só pode ser feito após a primeira rodada.', 'Fechar', { duration: 3000 });
      return;
    }
    if (this.hasPendente()) {
      this.snackBar.open('Existem cotações pendentes. Não é possível forçar o envio.', 'Fechar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Forçar Envio para Aprovação',
        message: 'Deseja forçar o envio das cotações recebidas para a etapa de Aprovação antes do término do tempo?'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.registrarLog('Envio forçado', 'Operador forçou o avanço para aprovação.');
        this.snackBar.open('Envio forçado para aprovação realizado com sucesso!', 'Fechar', { duration: 3000 });
        this.alertaConcorrenciaUnica = '';
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }
        this.requestAdvance.emit();
      }
    });
  }

  prorrogarNovamente() {
    this.quotations.forEach(q => {
      if (q.status !== 'Declinada' && q.status !== 'Cancelado' && q.status !== 'Expirada' && q.status !== 'Reprovado') {
        q.slaRestante = 30 * 60;
      }
    });
    this.timerSeconds = 30 * 60;
    this.concorrenciaUnicaLiberada = false;
    this.alertaConcorrenciaUnica = 'Prorrogado novamente por mais 30 minutos úteis.';
    this.iniciarTimer();
    this.registrarLog('Prorrogação manual', 'Operador ILC acionou prorrogação manual de +30 min.');
  }

  reabrirCotacaoExcepcionalmente(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Reabrir Cotação',
        message: 'Você deseja reabrir esta cotação? O status voltará para Pendente e ela terá 30 minutos úteis para editar.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        const quotation = this.quotations.find(q => q.id === id);
        const transportador = quotation?.transportadora || '';
        
        this.quotations = this.quotations.map(q => 
          q.id === id ? { ...q, status: 'Pendente', slaRestante: 30 * 60 } : q
        );
        if (!this.timerInterval) {
          this.iniciarTimer();
        }
        this.registrarLog('Reabertura Cotação', `Cotação #${id} para ${transportador} reaberta.`);
        this.snackBar.open(`Cotação reaberta com sucesso!`, 'Fechar', { duration: 3000 });
      }
    });
  }

  onAglutinadosChange(field: string, value: any) {
    this.registrarLog('Alteração dados agrupamento', `${field} alterado para: ${value}`);
  }
}
