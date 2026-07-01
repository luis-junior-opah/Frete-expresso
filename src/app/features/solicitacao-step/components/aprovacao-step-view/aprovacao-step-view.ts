import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
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
import { FilterModal } from '../cotacao-step-view/filter-modal';
import { SearchModal } from '../../../acompanhamento-panel/components/search-modal/search-modal';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-aprovacao-observacao-modal',
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
export class AprovacaoObservacaoModal {
  data = inject(MAT_DIALOG_DATA);
}

@Component({
  selector: 'app-reprovar-cobranca-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Reprovar Cobrança Extra</h2>
    <mat-dialog-content>
      <p style="margin-bottom: 16px; color: #475569; font-size: 0.9rem;">Por favor, insira o motivo pelo qual a cobrança extra não foi aprovada:</p>
      <mat-form-field appearance="outline" style="width: 100%;">
        <mat-label>Motivo da Reprovação</mat-label>
        <textarea matInput rows="4" [(ngModel)]="motivo" placeholder="Descreva a justificativa para reprovação..."></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end" style="padding-bottom: 16px; padding-right: 16px;">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="warn" [disabled]="!motivo.trim()" [mat-dialog-close]="motivo">Reprovar</button>
    </mat-dialog-actions>
  `
})
export class ReprovarCobrancaModal {
  motivo = '';
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
  selector: 'app-aprovacao-step-view',
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
  templateUrl: './aprovacao-step-view.html',
  styleUrl: './aprovacao-step-view.css',
})
export class AprovacaoStepView implements OnInit, OnDestroy, OnChanges {
  @Input() frete?: Frete;
  @Input() groupedDemands: DemandaAgrupavel[] = [];
  @Input() aglutinadosTipoVeiculo = 'Truck Aberto';
  @Output() onApproval = new EventEmitter<any>();

  // Métodos auxiliares para parse e comparação de datas de mock
  private parseDateTimeString(dateTimeStr?: string): Date | null {
    if (!dateTimeStr) return null;
    
    if (dateTimeStr.includes(' - ')) {
      const parts = dateTimeStr.split(' - ');
      const dParts = parts[0].split('-');
      const tParts = (parts[1] || '00:00').split(':');
      return new Date(+dParts[0], +dParts[1] - 1, +dParts[2], +tParts[0], +tParts[1]);
    }
    
    if (dateTimeStr.includes('/')) {
      const sanitized = dateTimeStr.replace(' - ', ' ');
      const parts = sanitized.split(' ');
      const dParts = parts[0].split('/');
      const tParts = (parts[1] || '00:00').split(':');
      return new Date(+dParts[2], +dParts[1] - 1, +dParts[0], +tParts[0], +tParts[1]);
    }

    const d = new Date(dateTimeStr);
    return isNaN(d.getTime()) ? null : d;
  }

  private formatarDataHoraBr(date: Date): string {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  get todasDemandas(): any[] {
    if (!this.frete) return this.groupedDemands;
    return [this.frete, ...this.groupedDemands];
  }

  get dataInicioJanelaConsolidada(): string {
    const datas = this.todasDemandas
      .map(d => this.parseDateTimeString(d.dataInicioJanela || d.inicioJanela))
      .filter((d): d is Date => d !== null);
    
    if (datas.length === 0) return this.frete?.dataInicioJanela || '';
    const minDate = new Date(Math.min(...datas.map(d => d.getTime())));
    return this.formatarDataHoraBr(minDate);
  }

  get dataFimJanelaConsolidada(): string {
    const datas = this.todasDemandas
      .map(d => this.parseDateTimeString(d.dataFimJanela || d.fimJanela))
      .filter((d): d is Date => d !== null);
    
    if (datas.length === 0) return this.frete?.dataFimJanela || '';
    const maxDate = new Date(Math.max(...datas.map(d => d.getTime())));
    return this.formatarDataHoraBr(maxDate);
  }

  get dataNecessidadeEntregaConsolidada(): string {
    const datas = this.todasDemandas
      .map(d => this.parseDateTimeString(d.dataNecessidadeEntrega || d.necessidadeEntrega))
      .filter((d): d is Date => d !== null);
    
    if (datas.length === 0) return this.frete?.dataNecessidadeEntrega || '';
    const minDate = new Date(Math.min(...datas.map(d => d.getTime())));
    return this.formatarDataHoraBr(minDate);
  }

  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  // Alçadas e SLA
  timerSeconds = 0;
  slaMinutes = 5;
  timerInterval: any;
  
  aprovadoresMatrix = [
    { nome: 'Ricardo Santos', email: 'ricardo.santos@empresa.com', nivel: 1, avatar: 'RS' },
    { nome: 'Juliana Mendes', email: 'juliana.mendes@empresa.com', nivel: 2, avatar: 'JM' },
    { nome: 'Marcos Oliveira', email: 'marcos.oliveira@empresa.com', nivel: 3, avatar: 'MO' }
  ];
  
  aprovadoresAtuais: any[] = [];
  proximoAprovadorIndex = 0;
  usuarioAprovador: string | null = null;

  observacao = '';
  logsAlteracao: any[] = [];
  aprovacaoRealizada = false;
  tipoAprovacao: 'individual' | 'agrupado' | 'simples' | null = null;
  idAprovado: number | null = null;
  selectedOptions: { qId: number, tipo: 'individual' | 'agrupado' | 'simples' }[] = [];
  cobrancaExtra: any = {
    tipoOcorrencia: 'Diária Excedente - Diária de motorista',
    justificativa: 'Fila de espera de mais de 8 horas para descarregamento no CD do cliente.',
    valor: 450.00,
    arquivos: ['evidencia_espera.pdf']
  };
  cobrancaStatus: 'Pendente' | 'Aprovado' | 'Reprovado' = 'Pendente';
  cobrancaMotivoReprovacao = '';

  private readonly complementarMetadata = { 
    id: 101,
    localColeta: 'Rua General Osório, 1200 - Centro, Ribeirão Preto - SP, 14010-000',
    dataInicio: '05/12/2023 - 08:00',
    dataFim: '10/12/2023 - 18:00',
    necessidade: '10/12/2023 - 20:00'
  };

  usuarioLogadoSimulado = 'Ricardo Santos';
  esforcoMercado = [
    { transportadora: 'VF (IVOTI)', status: 'Declinada' },
    { transportadora: 'ARMANI (CAMPINAS)', status: 'Expirada' }
  ];

  quotations = [
    {
      id: 1,
      status: 'Em Análise',
      transportadora: 'MIRASSOL',
      observacao: 'Cotação dentro do budget planejado para a rota.',
      temAnexo: true,
      showComplementar: true,
      showDetails: false,
      ordemEnvio: 1,
      individual: { ttColeta: 8, ttEntrega: 16, ttTotal: 24, valor: 7500, valorHistorico: 8000 },
      complementar: { 
        ...this.complementarMetadata,
        ttColeta: 8, ttEntrega: 16, ttTotal: 24, valor: 1500, valorHistorico: 1500, valorIndividual: 2000 
      }
    },
    {
      id: 2,
      status: 'Em Análise',
      transportadora: 'M3 LOGÍSTICA',
      observacao: 'Necessita validação de capacidade para o veículo solicitado.',
      temAnexo: false,
      showComplementar: true,
      showDetails: false,
      ordemEnvio: 2,
      individual: { ttColeta: 8, ttEntrega: 16, ttTotal: 24, valor: 9500, valorHistorico: 8500 },
      complementar: { 
        ...this.complementarMetadata,
        ttColeta: 8, ttEntrega: 16, ttTotal: 24, valor: 1500, valorHistorico: 1000, valorIndividual: 1800 
      }
    },
    {
      id: 3,
      status: 'Em Análise',
      transportadora: 'GOLDEN CARGO',
      observacao: 'Valor acima da média, porém com menor Transit Time.',
      temAnexo: true,
      showComplementar: true,
      showDetails: false,
      ordemEnvio: 3,
      individual: { ttColeta: 48, ttEntrega: 72, ttTotal: 120, valor: 7500, valorHistorico: 8000 },
      complementar: { 
        ...this.complementarMetadata,
        ttColeta: 8, ttEntrega: 16, ttTotal: 24, valor: 1500, valorHistorico: 1200, valorIndividual: 2200 
      }
    }
  ];

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
    }
  ];

  dataSource: DemandaAgrupavel[] = [];
  aglutinadosColumns: string[] = [
    'ag_id', 'ag_pedido', 'ag_fornecedor', 'ag_localColeta', 
    'ag_distancia', 'ag_inicioJanela', 'ag_fimJanela', 
    'ag_necessidadeEntrega', 'ag_modal', 'ag_tipoVeiculo', 'ag_fluxo', 
    'ag_tipoMaterial', 'ag_altura', 'ag_comprimento', 'ag_largura', 'ag_peso', 
    'ag_volumetria', 'ag_solicitante', 'ag_dataCriacao', 'ag_observacoes'
  ];
  aglutinadosPeso = 0;
  aglutinadosVolumetria = 0;
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
  
  currentFilters: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['groupedDemands']) {
      this.calcularTotaisAglutinados();
      this.ordenarQuotations();
      this.cdr.detectChanges();
    }
  }

  ngOnInit(): void {
    if (this.frete) {
      if (this.groupedDemands.length > 0) {
        this.calcularTotaisAglutinados();
      }
    }
    
    this.dataSource = this.allDemands
      .filter(d => !this.groupedDemands.some(g => g.id === d.id))
      .sort((a, b) => {
        const distA = parseInt(a.distancia);
        const distB = parseInt(b.distancia);
        return distA - distB;
      });

    this.ordenarQuotations();
    this.iniciarWorkflowAprovacao();
  }

  ordenarQuotations() {
    const isGrouped = this.groupedDemands && this.groupedDemands.length > 0;
    const getQuoteValue = (item: any) => isGrouped ? (item.individual.valor + (item.complementar?.valor || 0)) : item.individual.valor;
    const getQuoteTT = (item: any) => isGrouped ? (item.individual.ttTotal + (item.complementar?.ttTotal || 0)) : item.individual.ttTotal;

    const values = this.quotations.map(q => getQuoteValue(q));
    const tts = this.quotations.map(q => getQuoteTT(q));
    const minValor = Math.min(...values);
    const minTT = Math.min(...tts);

    const getScore = (q: any) => {
      const qVal = getQuoteValue(q);
      const qTT = getQuoteTT(q);
      const isBestPrice = qVal === minValor;
      const isBestTT = qTT === minTT;
      if (isBestPrice && isBestTT) return 3;
      if (isBestPrice) return 2;
      if (isBestTT) return 1;
      return 0;
    };

    this.quotations.sort((a, b) => {
      const scoreA = getScore(a);
      const scoreB = getScore(b);
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      return (a.ordemEnvio || 99) - (b.ordemEnvio || 99);
    });
  }

  getAnaliseTag(q: any) {
    const isGrouped = this.groupedDemands && this.groupedDemands.length > 0;
    const getQuoteValue = (item: any) => isGrouped ? (item.individual.valor + (item.complementar?.valor || 0)) : item.individual.valor;
    const getQuoteTT = (item: any) => isGrouped ? (item.individual.ttTotal + (item.complementar?.ttTotal || 0)) : item.individual.ttTotal;

    const values = this.quotations.map(item => getQuoteValue(item));
    const tts = this.quotations.map(item => getQuoteTT(item));
    const minValor = Math.min(...values);
    const minTT = Math.min(...tts);

    const qVal = getQuoteValue(q);
    const qTT = getQuoteTT(q);
    const isBestPrice = qVal === minValor;
    const isBestTT = qTT === minTT;

    if (isBestPrice && isBestTT) {
      return {
        label: 'Melhor oferta: menor transit time e menor valor',
        bg: '#dcfce7',
        color: '#15803d',
        border: '1px solid #86efac',
        icon: 'star'
      };
    } else if (isBestPrice) {
      return {
        label: 'Menor valor',
        bg: '#e0e7ff',
        color: '#4338ca',
        border: '1px solid #a5b4fc',
        icon: 'trending_down'
      };
    } else if (isBestTT) {
      return {
        label: 'Menor transit time',
        bg: '#fef3c7',
        color: '#d97706',
        border: '1px solid #fcd34d',
        icon: 'speed'
      };
    }
    return null;
  }

  getEconomia(q: any): number {
    if (!q.complementar) return 0;
    const somaIndividuais = q.individual.valor + (q.complementar.valorIndividual || 0);
    const valorAgrupada = q.individual.valor + q.complementar.valor;
    return Math.max(0, somaIndividuais - valorAgrupada);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  iniciarWorkflowAprovacao() {
    this.aprovadoresAtuais = [this.aprovadoresMatrix[0]];
    this.proximoAprovadorIndex = 1;
    this.timerSeconds = this.slaMinutes * 60;
    this.iniciarTimer();
  }

  iniciarTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
        this.cdr.detectChanges();
      } else {
        this.escalonarAprovacao();
      }
    }, 1000);
  }

  escalonarAprovacao() {
    if (this.proximoAprovadorIndex < this.aprovadoresMatrix.length) {
      const proximo = this.aprovadoresMatrix[this.proximoAprovadorIndex];
      this.aprovadoresAtuais = [...this.aprovadoresAtuais, proximo];
      this.proximoAprovadorIndex++;
      this.timerSeconds = this.slaMinutes * 60;
      
      this.registrarLog('Escalonamento de Alçada', `Tempo de SLA atingido. ${proximo.nome} (${proximo.email}) adicionado ao fluxo de aprovação.`);
      this.snackBar.open(`Aprovação escalonada para: ${proximo.nome}`, 'OK', { duration: 5000 });
      this.cdr.detectChanges();
    } else {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  get formattedTimer(): string {
    const minutes = Math.floor(this.timerSeconds / 60);
    const seconds = this.timerSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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

  abrirObservacao(obs: string) {
    if (!obs || obs === '-') return;
    this.dialog.open(AprovacaoObservacaoModal, {
      data: obs,
      width: '500px'
    });
  }

  getDuploCheck(valor: number, historico: number) {
    if (!historico) return { status: 'none', message: '' };
    
    const margemTolerancia = 10;
    const diffPercent = ((valor - historico) / historico) * 100;
    
    let status: 'danger' | 'info' | 'neutral' = 'neutral';
    let label = '';
    
    if (diffPercent > margemTolerancia) {
      status = 'danger';
      label = 'acima da tolerância de 10%';
    } else if (diffPercent < 0) {
      status = 'info';
      label = 'abaixo do histórico';
    } else {
      status = 'neutral';
      label = 'dentro da tolerância de 10%';
    }

    return {
      status: status,
      message: `Duplo check: valor cotado ${Math.abs(diffPercent).toFixed(1)}% ${diffPercent > 0 ? 'acima' : 'abaixo'} do histórico de fretes (${label}).`
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
        this.quotations = this.quotations.map(q => 
          q.id === id ? { ...q, status: 'Pendente' } : q
        );
        this.registrarLog('Reabertura de cotação', `Cotação #${id} reaberta.`);
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
        this.quotations = this.quotations.map(q => 
          q.id === id ? { ...q, status: 'Cancelado' } : q
        );
        this.registrarLog('Cancelamento de cotação', `Cotação #${id} cancelada.`);
      }
    });
  }

  isSelected(qId: number, tipo: 'individual' | 'agrupado' | 'simples'): boolean {
    if (this.aprovacaoRealizada && this.idAprovado === qId) {
      if (this.tipoAprovacao === tipo) {
        return true;
      }
      if (this.tipoAprovacao === 'individual' && tipo === 'simples') {
        return true;
      }
      if (this.tipoAprovacao === 'simples' && tipo === 'individual') {
        return true;
      }
    }
    return this.selectedOptions.some(o => o.qId === qId && o.tipo === tipo);
  }

  toggleSelection(qId: number, tipo: 'individual' | 'agrupado' | 'simples') {
    const index = this.selectedOptions.findIndex(o => o.qId === qId && o.tipo === tipo);
    if (index >= 0) {
      this.selectedOptions.splice(index, 1);
    } else {
      this.selectedOptions.push({ qId, tipo });
    }
    this.cdr.detectChanges();
  }

  getSelectionCount(): number {
    return this.selectedOptions.length;
  }

  aprovarSelecionada() {
    if (this.selectedOptions.length !== 1) {
      this.snackBar.open('Selecione exatamente uma cotação para aprovação.', 'Fechar', { duration: 3000 });
      return;
    }

    const sel = this.selectedOptions[0];
    const q = this.quotations.find(item => item.id === sel.qId);
    if (!q) return;

    const msg = sel.tipo === 'simples' ? 'cotação' : `cotação (${sel.tipo === 'individual' ? 'individual' : 'agrupada'})`;
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Confirmar Aprovação',
        message: `Deseja realmente aprovar a ${msg} da transportadora ${q.transportadora}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.aprovacaoRealizada = true;
        this.tipoAprovacao = sel.tipo;
        this.idAprovado = q.id;

        const aprovadorLogado = this.aprovadoresAtuais[this.aprovadoresAtuais.length - 1];
        this.usuarioAprovador = aprovadorLogado.nome;

        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }

        const approvedItem = { ...q, status: 'Aprovado' };

        if (sel.tipo === 'individual' && this.groupedDemands.length > 1) {
          const itemsToReturn = this.groupedDemands.filter(item => {
            return this.frete && Number(this.frete.id) !== item.id;
          });
          
          itemsToReturn.forEach(item => item.grouped = false);
          this.dataSource = [...this.dataSource, ...itemsToReturn].sort((a, b) => {
            return parseInt(a.distancia) - parseInt(b.distancia);
          });
          
          this.groupedDemands = [];
          this.registrarLog('Desmembramento automático', 'Aprovação individual disparou a separação dos fretes aglutinados');
        }

        this.quotations = this.quotations.map(item => {
          if (item.id === q.id) {
            return approvedItem;
          } else {
            return { ...item, status: 'Reprovado' };
          }
        });

        // Emitir estado para o pai (SolicitacaoStep)
        this.onApproval.emit({
          approvedQuotation: approvedItem,
          aprovadoresAtuais: [...this.aprovadoresAtuais],
          usuarioAprovador: this.usuarioAprovador,
          tipoAprovacao: sel.tipo
        });

        this.registrarLog('Aprovação realizada', `Cotação #${q.id} (${q.transportadora}) aprovada por ${this.usuarioAprovador} como ${sel.tipo}.`);
        this.snackBar.open(`Cotação aprovada com sucesso!`, 'Fechar', { duration: 3000 });
        this.selectedOptions = [];
        this.cdr.detectChanges();
      }
    });
  }

  onUserSimulatedChange() {
    this.cdr.detectChanges();
  }

  isAprovadorHabilitado(): boolean {
    return this.aprovadoresAtuais.some(a => a.nome === this.usuarioLogadoSimulado);
  }

  reprovarSelecionadas() {
    if (this.selectedOptions.length === 0) {
      this.snackBar.open('Selecione pelo menos uma cotação para reprovar.', 'Fechar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Reprovar Cotações',
        message: 'Deseja realmente reprovar as cotações selecionadas?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const selectedIds = new Set(this.selectedOptions.map(o => o.qId));
        this.quotations = this.quotations.map(q => {
          if (selectedIds.has(q.id)) {
            return { ...q, status: 'Reprovado' };
          }
          return q;
        });

        this.registrarLog('Reprovação de Cotações', `Cotações selecionadas (${Array.from(selectedIds).join(', ')}) foram reprovadas.`);
        this.snackBar.open('Cotações reprovadas com sucesso.', 'Fechar', { duration: 3000 });

        const hasPendente = this.quotations.some(q => q.status === 'Em Análise' || q.status === 'Pendente');
        if (!hasPendente) {
          this.aprovacaoRealizada = true;
        }

        this.selectedOptions = [];
        this.cdr.detectChanges();
      }
    });
  }

  private registrarLog(acao: string, detalhes: string = '') {
    const now = new Date();
    const log = {
      data: now.toLocaleDateString('pt-BR'),
      hora: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      usuario: this.usuarioAprovador || 'usuario.logado@empresa.com',
      acao: acao,
      detalhes: detalhes
    };
    this.logsAlteracao = [log, ...this.logsAlteracao];
  }

  onAglutinadosChange(field: string, value: any) {
    this.registrarLog('Alteração dados agrupamento', `${field} alterado para: ${value}`);
  }

  isLinkedColetaVisible(itemId: number): boolean {
    if (!this.frete || !this.frete.id) return true;
    return itemId !== Number(this.frete.id);
  }

  aprovarCobranca() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Confirmar Aprovação',
        message: 'Deseja realmente aprovar esta cobrança extra?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cobrancaStatus = 'Aprovado';
        this.cobrancaMotivoReprovacao = '';
        this.registrarLog('Aprovação de Cobrança Extra', `Cobrança extra no valor de R$ ${this.cobrancaExtra.valor.toFixed(2)} aprovada.`);
        this.snackBar.open('Cobrança extra aprovada com sucesso!', 'Fechar', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  reprovarCobranca() {
    const dialogRef = this.dialog.open(ReprovarCobrancaModal, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(reason => {
      if (reason) {
        this.cobrancaStatus = 'Reprovado';
        this.cobrancaMotivoReprovacao = reason;
        this.registrarLog('Reprovação de Cobrança Extra', `Cobrança extra reprovada. Motivo: ${reason}`);
        this.snackBar.open('Cobrança extra reprovada com sucesso.', 'Fechar', { duration: 3000 });
        this.cdr.detectChanges();
      }
    });
  }

  downloadArquivos() {
    if (this.cobrancaExtra.arquivos && this.cobrancaExtra.arquivos.length > 0) {
      this.snackBar.open(`Baixando evidência: ${this.cobrancaExtra.arquivos[0]}`, 'Fechar', { duration: 3000 });
    }
  }

  aprovarDiretamente(qId: number, tipo: 'individual' | 'agrupado' | 'simples') {
    this.selectedOptions = [{ qId, tipo }];
    this.aprovarSelecionada();
  }

  reprovarDiretamente(qId: number, tipo: 'individual' | 'agrupado' | 'simples') {
    this.selectedOptions = [{ qId, tipo }];
    this.reprovarSelecionadas();
  }
}
