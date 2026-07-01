import { Component, Input, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { SolicitacaoCard } from '../solicitacao-card/solicitacao-card';
import { Frete } from '../../../../core/models/frete.model';
import { FreteService } from '../../../../core/services/frete.service';

@Component({
  selector: 'app-validacao-observacao-modal',
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
export class ValidacaoObservacaoModal {
  data = inject(MAT_DIALOG_DATA);
}

@Component({
  selector: 'app-validacao-step-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatIconModule,
    MatSnackBarModule,
    MatTableModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    SolicitacaoCard
  ],
  templateUrl: './validacao-step-view.html',
  styleUrl: './validacao-step-view.css',
})
export class ValidacaoStepView implements OnInit, OnChanges {
  @Input() frete?: Frete;
  @Input() groupedDemands: any[] = [];
  @Input() aglutinadosTipoVeiculo = '';

  // Dados da Aprovação (Vindos do Step 3)
  @Input() approvedQuotation: any = null;
  @Input() aprovadoresAtuais: any[] = [];
  @Input() usuarioAprovador: string | null = null;
  @Input() tipoAprovacao: string | null = null;

  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private freteService = inject(FreteService);

  justificativa = '';
  dataInicioJanela: string | Date = '';
  horaInicioJanela = '';
  dataFimJanela: string | Date = '';
  horaFimJanela = '';
  dataNecessidadeEntrega: string | Date = '';
  horaNecessidadeEntrega = '';
  hasInitializedFields = false;

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

  aglutinadosColumns: string[] = [
    'ag_id', 'ag_pedido', 'ag_fornecedor', 'ag_localColeta', 
    'ag_distancia', 'ag_inicioJanela', 'ag_fimJanela', 
    'ag_necessidadeEntrega', 'ag_modal', 'ag_tipoVeiculo', 'ag_fluxo', 
    'ag_tipoMaterial', 'ag_altura', 'ag_comprimento', 'ag_largura', 'ag_peso', 
    'ag_volumetria', 'ag_solicitante', 'ag_dataCriacao', 'ag_observacoes'
  ];

  get aglutinadosPeso(): number {
    return this.groupedDemands.reduce((sum, item) => sum + (item.peso || 0), 0);
  }

  get aglutinadosVolumetria(): number {
    return this.groupedDemands.reduce((sum, item) => sum + (item.volumetria || 0), 0);
  }

  get aglutinadosPesoCubado(): number {
    return this.groupedDemands.reduce((sum, item) => {
      const h = item.altura || 0;
      const l = item.largura || 0;
      const c = item.comprimento || 0;
      return sum + ((h * l * c) * 300);
    }, 0);
  }

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

  abrirObservacao(obs: string) {
    if (!obs || obs === '-') return;
    this.dialog.open(ValidacaoObservacaoModal, {
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
      message: `Duplo check: valor cotado ${Math.abs(diffPercent).toFixed(1)}% ${diffPercent > 0 ? 'acima' : 'abaixo'} do histórico.`
    };
  }

  showCheckMessage(message: string) {
    this.snackBar.open(message, 'OK', { duration: 5000 });
  }

  adicionarAnexo() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.onchange = (e: any) => {
      const files = e.target.files;
      if (files.length > 0) {
        this.snackBar.open(`${files.length} arquivo(s) selecionado(s) com sucesso!`, 'OK', { duration: 3000 });
      }
    };
    fileInput.click();
  }

  parseDateTime(dateTimeStr?: any): { date: string, time: string } {
    if (!dateTimeStr) return { date: '', time: '' };

    // Support Date objects
    if (dateTimeStr instanceof Date) {
      return {
        date: this.formatToDateString(dateTimeStr),
        time: this.formatToTimeString(dateTimeStr)
      };
    }

    if (typeof dateTimeStr !== 'string') {
      try {
        dateTimeStr = String(dateTimeStr);
      } catch (e) {
        return { date: '', time: '' };
      }
    }

    // Split by separator ' - ' first
    if (dateTimeStr.includes(' - ')) {
      const parts = dateTimeStr.split(' - ');
      return this.parseDateAndTimeParts(parts[0], parts[1] || '00:00');
    }

    // If it has 'T' (ISO format)
    if (dateTimeStr.includes('T')) {
      const parts = dateTimeStr.split('T');
      return this.parseDateAndTimeParts(parts[0], parts[1]);
    }

    // Otherwise, split by space
    const parts = dateTimeStr.trim().split(/\s+/);
    if (parts.length >= 2) {
      return this.parseDateAndTimeParts(parts[0], parts[1]);
    } else if (parts.length === 1) {
      return this.parseDateAndTimeParts(parts[0], '00:00');
    }

    return { date: '', time: '' };
  }

  private parseDateAndTimeParts(datePart: string, timePart: string): { date: string, time: string } {
    datePart = datePart.trim();
    timePart = timePart.trim().substring(0, 5);

    // Format YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return { date: datePart, time: timePart };
    }

    // Format DD/MM/YYYY
    if (datePart.includes('/')) {
      const dParts = datePart.split('/');
      if (dParts.length === 3) {
        return {
          date: `${dParts[2]}-${dParts[1].padStart(2, '0')}-${dParts[0].padStart(2, '0')}`,
          time: timePart
        };
      }
    }

    // Format DD-MM-YYYY
    if (datePart.includes('-')) {
      const dParts = datePart.split('-');
      if (dParts.length === 3) {
        if (dParts[0].length === 4) {
          return { date: datePart, time: timePart };
        }
        return {
          date: `${dParts[2]}-${dParts[1].padStart(2, '0')}-${dParts[0].padStart(2, '0')}`,
          time: timePart
        };
      }
    }

    return { date: '', time: '' };
  }

  formatToDateString(date: Date): string {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  formatToTimeString(date: Date): string {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  formatDatePtBr(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['frete'] && this.frete && !this.hasInitializedFields) {
      this.preencherCamposComFrete();
    }
  }

  ngOnInit() {
    this.preencherCamposComFrete();
  }

  parseLocalDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const localD = new Date(year, month, day);
      if (!isNaN(localD.getTime())) {
        return localD;
      }
    }
    return null;
  }

  preencherCamposComFrete() {
    if (this.frete && this.frete.dataInicioJanela) {
      const parsedInicio = this.parseDateTime(this.frete.dataInicioJanela);
      const parsedFim = this.parseDateTime(this.frete.dataFimJanela);
      const parsedNecessidade = this.parseDateTime(this.frete.dataNecessidadeEntrega);

      if (parsedInicio.date) {
        this.dataInicioJanela = this.parseLocalDate(parsedInicio.date) || parsedInicio.date;
        this.horaInicioJanela = parsedInicio.time;
      }
      if (parsedFim.date) {
        this.dataFimJanela = this.parseLocalDate(parsedFim.date) || parsedFim.date;
        this.horaFimJanela = parsedFim.time;
      }
      if (parsedNecessidade.date) {
        this.dataNecessidadeEntrega = this.parseLocalDate(parsedNecessidade.date) || parsedNecessidade.date;
        this.horaNecessidadeEntrega = parsedNecessidade.time;
      }
      
      if (parsedInicio.date && parsedFim.date && parsedNecessidade.date) {
        this.hasInitializedFields = true;
      }
    } else {
      const now = new Date();
      this.dataInicioJanela = this.formatToDateString(now);
      this.horaInicioJanela = '08:00';

      const endColeta = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      this.dataFimJanela = this.formatToDateString(endColeta);
      this.horaFimJanela = this.formatToTimeString(endColeta);

      const needDelivery = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      this.dataNecessidadeEntrega = this.formatToDateString(needDelivery);
      this.horaNecessidadeEntrega = this.formatToTimeString(needDelivery);
    }
  }

  private adicionarHorasUteis(
    dataInicio: Date, 
    horasAdicionar: number
  ): Date {
    const dataAtual = new Date(dataInicio.getTime());
    
    // Parse do expediente dinâmico vindo do FreteService
    const inicioExpedienteStr = this.freteService.horarioInicio() || '07:00';
    const fimExpedienteStr = this.freteService.horarioFim() || '20:00';
    
    const [iniH, iniM] = inicioExpedienteStr.split(':').map(Number);
    const [fimH, fimM] = fimExpedienteStr.split(':').map(Number);
    
    const isFimDeSemanaOuFeriado = (d: Date): boolean => {
      const dia = d.getDay(); // 0 = Domingo, 6 = Sábado
      if (dia === 0 || dia === 6) return true;
      
      const yyyymmdd = d.getFullYear() + '-' + 
                       String(d.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(d.getDate()).padStart(2, '0');
      // Valida contra o cadastro dinâmico de feriados nas configurações do sistema
      return this.freteService.feriados().some((f: any) => f.data === yyyymmdd);
    };
    
    const obterProximoInicioExpediente = (d: Date): Date => {
      const proximo = new Date(d.getTime());
      proximo.setDate(proximo.getDate() + 1);
      proximo.setHours(iniH, iniM, 0, 0);
      while (isFimDeSemanaOuFeriado(proximo)) {
        proximo.setDate(proximo.getDate() + 1);
      }
      return proximo;
    };
 
    // Ajusta se estiver fora do horário útil
    const horaAtualMin = dataAtual.getHours() * 60 + dataAtual.getMinutes();
    const inicioExpMin = iniH * 60 + iniM;
    const fimExpMin = fimH * 60 + fimM;
 
    if (isFimDeSemanaOuFeriado(dataAtual) || horaAtualMin < inicioExpMin) {
      dataAtual.setHours(iniH, iniM, 0, 0);
      while (isFimDeSemanaOuFeriado(dataAtual)) {
        dataAtual.setDate(dataAtual.getDate() + 1);
      }
    } else if (horaAtualMin > fimExpMin) {
      dataAtual.setTime(obterProximoInicioExpediente(dataAtual).getTime());
    }
 
    let horasRestantes = horasAdicionar;
    
    while (horasRestantes > 0) {
      const fimExpHoje = new Date(dataAtual.getTime());
      fimExpHoje.setHours(fimH, fimM, 0, 0);
      
      const diffMs = fimExpHoje.getTime() - dataAtual.getTime();
      const horasDisponiveisHoje = diffMs / (1000 * 60 * 60);
      
      if (horasRestantes <= horasDisponiveisHoje) {
        dataAtual.setTime(dataAtual.getTime() + horasRestantes * 60 * 60 * 1000);
        horasRestantes = 0;
      } else {
        horasRestantes -= horasDisponiveisHoje;
        dataAtual.setTime(obterProximoInicioExpediente(dataAtual).getTime());
      }
    }
    
    return dataAtual;
  }

  formatarDataBr(date: Date): string {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  getFormattedDateString(val: string | Date | null): string {
    if (!val) return '';
    if (val instanceof Date) {
      return this.formatToDateString(val);
    }
    return val;
  }

  roundToMinute(date: Date): number {
    if (!date || isNaN(date.getTime())) return 0;
    return Math.floor(date.getTime() / 60000) * 60000;
  }

  get sugestaoJanelas() {
    if (!this.frete) return null;

    let dataAprovacao = new Date();
    if (this.approvedQuotation && this.approvedQuotation.dataSubmissao) {
      try {
        const parts = this.approvedQuotation.dataSubmissao.split(' - ');
        if (parts.length === 2) {
          const dParts = parts[0].split('/');
          const tParts = parts[1].split(':');
          const dateObj = new Date(+dParts[2], +dParts[1] - 1, +dParts[0], +tParts[0], +tParts[1]);
          if (!isNaN(dateObj.getTime())) {
            dataAprovacao = dateObj;
          }
        }
      } catch (e) {}
    }

    const now = new Date();
    const dataBase = dataAprovacao.getTime() > now.getTime() ? dataAprovacao : now;

    let tempoAtual = new Date(dataBase.getTime() + 1 * 60 * 60 * 1000);
    const startColeta = new Date(tempoAtual.getTime());

    const ttColeta = this.approvedQuotation ? this.approvedQuotation.individual.ttColeta : 4;
    const ttEntrega = this.approvedQuotation ? this.approvedQuotation.individual.ttEntrega : 20;
    const tempoCargaHoras = this.freteService.tempoCarregamentoColeta() || 2;

    tempoAtual = this.adicionarHorasUteis(tempoAtual, ttColeta);
    
    const uniqueSuppliers: string[] = [this.frete.fornecedor];
    this.groupedDemands.forEach((d) => {
      if (!uniqueSuppliers.includes(d.fornecedor)) {
        uniqueSuppliers.push(d.fornecedor);
        tempoAtual = this.adicionarHorasUteis(tempoAtual, this.freteService.tempoDeslocamentoColetas() || 4);
        tempoAtual = this.adicionarHorasUteis(tempoAtual, tempoCargaHoras);
      }
    });

    // Prover folga de 3 horas para garantir viabilidade contra imprevistos de tráfego/expediente
    const endColeta = new Date(tempoAtual.getTime() + 3 * 60 * 60 * 1000);

    tempoAtual = this.adicionarHorasUteis(tempoAtual, ttEntrega);
    const needDelivery = new Date(tempoAtual.getTime() + 3 * 60 * 60 * 1000);

    return {
      dataInicio: startColeta,
      dataFim: endColeta,
      dataEntrega: needDelivery,
      formattedInicio: {
        date: this.formatToDateString(startColeta),
        time: this.formatToTimeString(startColeta)
      },
      formattedFim: {
        date: this.formatToDateString(endColeta),
        time: this.formatToTimeString(endColeta)
      },
      formattedEntrega: {
        date: this.formatToDateString(needDelivery),
        time: this.formatToTimeString(needDelivery)
      }
    };
  }

  aplicarSugestao() {
    const sug = this.sugestaoJanelas;
    if (sug) {
      this.dataInicioJanela = sug.dataInicio;
      this.horaInicioJanela = sug.formattedInicio.time;
      this.dataFimJanela = sug.dataFim;
      this.horaFimJanela = sug.formattedFim.time;
      this.dataNecessidadeEntrega = sug.dataEntrega;
      this.horaNecessidadeEntrega = sug.formattedEntrega.time;
      
      this.snackBar.open('Sugestão viável aplicada aos campos! Clique em Salvar para persistir.', 'OK', { duration: 4000 });
    }
  }

  get todasDemandas(): any[] {
    if (!this.frete) return [];
    return [this.frete, ...this.groupedDemands];
  }

  get analiseComparativa() {
    const dateInicioStr = this.getFormattedDateString(this.dataInicioJanela);
    const dateFimStr = this.getFormattedDateString(this.dataFimJanela);
    const dateNecessidadeStr = this.getFormattedDateString(this.dataNecessidadeEntrega);

    if (!this.frete || !dateInicioStr || !this.horaInicioJanela || 
        !dateFimStr || !this.horaFimJanela || 
        !dateNecessidadeStr || !this.horaNecessidadeEntrega) {
      return null;
    }

    const startColeta = new Date(`${dateInicioStr}T${this.horaInicioJanela}`);
    const endColeta = new Date(`${dateFimStr}T${this.horaFimJanela}`);
    const needDelivery = new Date(`${dateNecessidadeStr}T${this.horaNecessidadeEntrega}`);
    
    if (isNaN(startColeta.getTime()) || isNaN(endColeta.getTime()) || isNaN(needDelivery.getTime())) {
      return null;
    }

    // Transit Times da cotação
    const ttColeta = this.approvedQuotation 
      ? (this.approvedQuotation.individual.ttColeta) 
      : 4;

    const ttEntrega = this.approvedQuotation 
      ? (this.approvedQuotation.individual.ttEntrega) 
      : 20;

    // Simula a data/hora da aprovação (now ou data de submissão do lance)
    let dataAprovacao = new Date();
    if (this.approvedQuotation && this.approvedQuotation.dataSubmissao) {
      try {
        const parts = this.approvedQuotation.dataSubmissao.split(' - ');
        if (parts.length === 2) {
          const dParts = parts[0].split('/');
          const tParts = parts[1].split(':');
          const dateObj = new Date(+dParts[2], +dParts[1] - 1, +dParts[0], +tParts[0], +tParts[1]);
          if (!isNaN(dateObj.getTime())) {
            dataAprovacao = dateObj;
          }
        }
      } catch (e) {
        // Fallback
      }
    }

    // Monta o Roteiro Sequencial de Coletas: paradas = [Principal, Adicionais]
    const paradas: { id: string; fornecedor: string; inicioJanela: Date; fimJanela: Date; ttAteAqui: number }[] = [
      {
        id: this.frete.id,
        fornecedor: this.frete.fornecedor,
        inicioJanela: startColeta,
        fimJanela: endColeta,
        ttAteAqui: ttColeta // Posicionamento inicial
      }
    ];

    this.groupedDemands.forEach((d) => {
      const existe = paradas.some(p => p.fornecedor === d.fornecedor);
      if (!existe) {
        paradas.push({
          id: d.id,
          fornecedor: d.fornecedor,
          inicioJanela: startColeta,
          fimJanela: endColeta,
          ttAteAqui: this.freteService.tempoDeslocamentoColetas() || 4 // Tempo de trânsito útil configurado
        });
      }
    });
 
    let tempoAtual = new Date(dataAprovacao.getTime());
    const logs: string[] = [];
    let viavelColeta = true;
    let motivoInviabilidade = '';
    const tempoCargaHoras = this.freteService.tempoCarregamentoColeta() || 2; // Tempo de carregamento configurado
 
    logs.push(`* Simulação iniciada a partir da aprovação: ${this.formatarDataBr(dataAprovacao)}`);

    for (let i = 0; i < paradas.length; i++) {
      const p = paradas[i];
      // 1. Deslocamento útil
      tempoAtual = this.adicionarHorasUteis(tempoAtual, p.ttAteAqui);
      
      logs.push(`• Chegada em [${p.fornecedor}]: ${this.formatarDataBr(tempoAtual)}`);
      
      // Valida fim de janela (com precisão de minuto)
      if (this.roundToMinute(tempoAtual) > this.roundToMinute(p.fimJanela)) {
        viavelColeta = false;
        motivoInviabilidade = `Posicionamento em [${p.fornecedor}] às ${this.formatarDataBr(tempoAtual)} ultrapassa a janela (${this.formatarDataBr(p.fimJanela)}).`;
        logs.push(`  ✗ INVIÁVEL: Janela expirou no fornecedor [${p.fornecedor}].`);
        break;
      }

      // Se chegar antes do início da janela, aguarda a abertura (com precisão de minuto)
      if (this.roundToMinute(tempoAtual) < this.roundToMinute(p.inicioJanela)) {
        tempoAtual = new Date(p.inicioJanela.getTime());
        logs.push(`  * Aguardando abertura da janela em [${p.fornecedor}] até ${this.formatarDataBr(tempoAtual)}`);
      }

      // Carregamento
      tempoAtual = this.adicionarHorasUteis(tempoAtual, tempoCargaHoras);
      logs.push(`  ✓ Coleta concluída em [${p.fornecedor}]. Saída: ${this.formatarDataBr(tempoAtual)}`);
    }

    // 4. Trânsito de entrega final
    let viavelEntrega = true;
    let previsaoEntrega = new Date();
    
    if (viavelColeta) {
      tempoAtual = this.adicionarHorasUteis(tempoAtual, ttEntrega);
      previsaoEntrega = new Date(tempoAtual.getTime());
      logs.push(`• Chegada prevista na Entrega: ${this.formatarDataBr(previsaoEntrega)}`);
      
      const menorPrazoEntrega = needDelivery;

      if (this.roundToMinute(previsaoEntrega) > this.roundToMinute(menorPrazoEntrega)) {
        viavelEntrega = false;
        motivoInviabilidade = `Entrega final às ${this.formatarDataBr(previsaoEntrega)} excede o prazo limite de necessidade (${this.formatarDataBr(menorPrazoEntrega)}).`;
        logs.push(`  ✗ INVIÁVEL: Estouro do prazo de necessidade de entrega final.`);
      } else {
        logs.push(`  ✓ Entrega dentro do SLA. Prazo limite: ${this.formatarDataBr(menorPrazoEntrega)}`);
      }
    }

    const viavel = viavelColeta && viavelEntrega;

    return {
      ttColeta,
      ttEntrega,
      previsaoColeta: this.formatarDataBr(tempoAtual),
      previsaoEntrega: this.formatarDataBr(previsaoEntrega),
      viavelColeta,
      viavelEntrega,
      viavel,
      motivoInviabilidade,
      logsSimulacao: logs
    };
  }

  salvarJanelas() {
    const dateInicioStr = this.getFormattedDateString(this.dataInicioJanela);
    const dateFimStr = this.getFormattedDateString(this.dataFimJanela);
    const dateNecessidadeStr = this.getFormattedDateString(this.dataNecessidadeEntrega);

    if (!dateInicioStr || !this.horaInicioJanela || !dateFimStr || !this.horaFimJanela || !dateNecessidadeStr || !this.horaNecessidadeEntrega) {
      this.snackBar.open('Por favor, preencha todos os campos da janela operacional.', 'Fechar', { duration: 4000 });
      return;
    }

    const start = new Date(`${dateInicioStr}T${this.horaInicioJanela}`);
    const end = new Date(`${dateFimStr}T${this.horaFimJanela}`);
    const need = new Date(`${dateNecessidadeStr}T${this.horaNecessidadeEntrega}`);

    if (start.getTime() >= end.getTime()) {
      this.snackBar.open('A data de início da janela de coleta não pode ser maior ou igual à data final da coleta.', 'Erro', { duration: 4000 });
      return;
    }

    if (start.getTime() >= need.getTime()) {
      this.snackBar.open('A data de início da janela de coleta não pode ser maior ou igual à necessidade de entrega.', 'Erro', { duration: 4000 });
      return;
    }

    if (this.frete) {
      const dataInicioJanela = `${this.formatDatePtBr(dateInicioStr)} ${this.horaInicioJanela}`;
      const dataFimJanela = `${this.formatDatePtBr(dateFimStr)} ${this.horaFimJanela}`;
      const dataNecessidadeEntrega = `${this.formatDatePtBr(dateNecessidadeStr)} ${this.horaNecessidadeEntrega}`;

      this.frete.dataInicioJanela = dataInicioJanela;
      this.frete.dataFimJanela = dataFimJanela;
      this.frete.dataNecessidadeEntrega = dataNecessidadeEntrega;

      this.freteService.updateFrete(this.frete.id, {
        dataInicioJanela,
        dataFimJanela,
        dataNecessidadeEntrega
      });
    }

    this.snackBar.open('Janelas operacionais salvas com sucesso!', 'OK', { duration: 3000 });
  }

  aprovarFrete() {
    if (!this.justificativa) {
      this.snackBar.open('Por favor, preencha a justificativa antes de aprovar.', 'Fechar', { duration: 4000 });
      return;
    }

    const analise = this.analiseComparativa;
    if (!analise) {
      this.snackBar.open('Erro ao analisar a viabilidade do frete.', 'Erro', { duration: 4000 });
      return;
    }

    if (!analise.viavel) {
      this.snackBar.open(analise.motivoInviabilidade, 'Fechar', {
        duration: 6000,
        panelClass: ['premium-toast-error'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Confirmar Aprovação Final',
        message: 'Deseja realmente realizar a aprovação final deste Frete Expresso?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Frete Expresso aprovado com sucesso!', 'Sucesso', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  solicitarCorrecao() {
    if (!this.justificativa || this.justificativa.length < 15) {
      this.snackBar.open('Por favor, preencha a justificativa operacional (mínimo 15 caracteres) antes de solicitar correção.', 'Fechar', { duration: 4000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Confirmar Solicitação de Correção',
        message: 'Deseja reabrir os campos de proposta do transportador para correção de valores/prazos?'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        if (this.approvedQuotation) {
          this.approvedQuotation.status = 'Pendente';
        }
        this.snackBar.open('Cotação devolvida para o transportador. SLA individual de 30 minutos iniciado.', 'Sucesso', { duration: 3500 });
      }
    });
  }

  cancelarFrete() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Confirmar Cancelamento',
        message: 'Deseja realmente cancelar esta solicitação de frete? Esta ação não pode ser desfeita.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Solicitação de frete cancelada.', 'Fechar', { duration: 3000 });
      }
    });
  }

  showTimePicker(inputElement: HTMLInputElement) {
    if (inputElement && typeof inputElement.showPicker === 'function') {
      try {
        inputElement.showPicker();
      } catch (error) {
        inputElement.click();
      }
    } else if (inputElement) {
      inputElement.click();
    }
  }
}
