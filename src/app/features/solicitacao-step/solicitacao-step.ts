import { Component, inject, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FreteService } from '../../core/services/frete.service';
import { Frete } from '../../core/models/frete.model';
import { SearchModal } from '../acompanhamento-panel/components/search-modal/search-modal';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { AddressModal } from './components/address-modal/address-modal';

import { CotacaoStepView } from './components/cotacao-step-view/cotacao-step-view';
import { AprovacaoStepView } from './components/aprovacao-step-view/aprovacao-step-view';
import { ValidacaoStepView } from './components/validacao-step-view/validacao-step-view';
import { PedidoStepView } from './components/pedido-step-view/pedido-step-view';
import { ResumoStepView } from './components/resumo-step-view/resumo-step-view';

@Component({
  selector: 'app-solicitacao-step',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    FormsModule,
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatStepperModule,
    MatTableModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatDialogModule,
    CotacaoStepView,
    AprovacaoStepView,
    ValidacaoStepView,
    PedidoStepView,
    ResumoStepView
  ],
  templateUrl: './solicitacao-step.html',
  styleUrls: ['./solicitacao-step.css']
})
export class SolicitacaoStep implements OnInit {
  private fb = inject(FormBuilder);
  private freteService = inject(FreteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  @ViewChild('stepper') stepper!: MatStepper;
  @ViewChild(CotacaoStepView) cotacaoView?: CotacaoStepView;

  activeStep = 0;
  steps = ['Solicitação', 'Cotação', 'Aprovação', 'Validação', 'Pedido', 'Resumo'];

  // Estado compartilhado entre steps para simular persistência
  sharedGroupedDemands: any[] = [];
  sharedVehicle: string = '';
  sharedApprovedQuotation: any = null;
  sharedAprovadoresAtuais: any[] = [];
  sharedUsuarioAprovador: string | null = null;
  sharedTipoAprovacao: string | null = null;
  sharedCobrancaExtra: any = null;

  solicitacaoGerada = false;
  logsAlteracao: any[] = [];
  freteEdicaoId: string | null = null;
  valoresAnteriores: any = {};

  veiculos = [
    { value: 'Aéreo', label: 'Aéreo - Capacidade máx: 999999.0 Kgs - 94.5 m³', pesoMax: 999999.0, volumetriaMax: 94.5 },
    { value: 'Truck Aberto', label: 'Truck Aberto - Capacidade máx: 12000.0 Kgs - 50.63 m³', pesoMax: 12000.0, volumetriaMax: 50.63 },
    { value: '3/4 Aberto', label: '3/4 Aberto - Capacidade máx: 3000.0 Kgs - 20.0 m³', pesoMax: 3000.0, volumetriaMax: 20.0 },
    { value: 'Carreta Bau', label: 'Carreta Bau - Capacidade máx: 25000.0 Kgs - 94.5 m³', pesoMax: 25000.0, volumetriaMax: 94.5 },
    { value: 'Carreta Vanderleia', label: 'Carreta Vanderleia - Capacidade máx: 34000.0 Kgs - 94.5 m³', pesoMax: 34000.0, volumetriaMax: 94.5 },
    { value: 'Utilitario', label: 'Utilitario - Capacidade máx: 500.0 Kgs - 2.85 m³', pesoMax: 500.0, volumetriaMax: 2.85 },
    { value: 'Van', label: 'Van - Capacidade máx: 1500.0 Kgs - 9.03 m³', pesoMax: 1500.0, volumetriaMax: 9.03 },
    { value: '3/4', label: '3/4 - Capacidade máx: 3000.0 Kgs - 20.0 m³', pesoMax: 3000.0, volumetriaMax: 20.0 },
    { value: 'Toco', label: 'Toco - Capacidade máx: 6000.0 Kgs - 46.38 m³', pesoMax: 6000.0, volumetriaMax: 46.38 },
    { value: 'Truck Sider', label: 'Truck Sider - Capacidade máx: 12000.0 Kgs - 50.63 m³', pesoMax: 12000.0, volumetriaMax: 50.63 },
    { value: 'Carreta Sider', label: 'Carreta Sider - Capacidade máx: 25000.0 Kgs - 94.5 m³', pesoMax: 25000.0, volumetriaMax: 94.5 },
    { value: 'Rodotrem Sider', label: 'Rodotrem Sider - Capacidade máx: 45000.0 Kgs - 168.75 m³', pesoMax: 45000.0, volumetriaMax: 168.75 },
    { value: 'Carreta Aberta', label: 'Carreta Aberta - Capacidade máx: 25000.0 Kgs - 94.5 m³', pesoMax: 25000.0, volumetriaMax: 94.5 },
    { value: 'Rodotrem Light', label: 'Rodotrem Light - Capacidade máx: 22000.0 Kgs - 189.0 m³', pesoMax: 22000.0, volumetriaMax: 189.0 },
    { value: 'Truck Van', label: 'Truck Van - Capacidade máx: 25000.0 Kgs - 94.5 m³', pesoMax: 25000.0, volumetriaMax: 94.5 },
    { value: 'Truck Bau', label: 'Truck Bau - Capacidade máx: 12000.0 Kgs - 50.63 m³', pesoMax: 12000.0, volumetriaMax: 50.63 },
    { value: 'Rodotrem Bau', label: 'Rodotrem Bau - Capacidade máx: 22000.0 Kgs - 189.0 m³', pesoMax: 22000.0, volumetriaMax: 189.0 }
  ];
  filteredVeiculos: any[] = [];

  // Mapeamento de campos para nomes amigáveis
  private readonly fieldLabels: { [key: string]: string } = {
    fornecedor: 'Fornecedor',
    codUnidade: 'Cód. Unidade',
    cliente: 'Cliente',
    enderecoColeta: 'Endereço de coleta',
    enderecoEntrega: 'Endereço de entrega',
    dataInicioJanela: 'Início janela',
    horaInicioJanela: 'Hora início',
    dataFimJanela: 'Fim janela',
    horaFimJanela: 'Hora fim',
    dataNecessidadeEntrega: 'Necessidade',
    horaNecessidadeEntrega: 'Hora necessidade',
    modal: 'Modal',
    tipoVeiculo: 'Tipo de veículo',
    fluxo: 'Fluxo',
    tipoMaterial: 'Tipo de material',
    altura: 'Altura',
    comprimento: 'Comprimento',
    largura: 'Largura',
    peso: 'Peso',
    volumetria: 'Volumetria',
    permitirAgrupamento: 'Permite agrupamento',
    justificativa: 'Justificativa',
    observacoes: 'Observações'
  };

  get mockFrete() {
    return this.freteService.getFreteById('21978');
  }

  solicitacaoForm: FormGroup = this.fb.group({
    fornecedor: ['', Validators.required],
    codUnidade: ['', Validators.required],
    cliente: ['', Validators.required],
    enderecoColeta: [''],
    enderecoEntrega: [''],
    dataInicioJanela: ['', Validators.required],
    horaInicioJanela: ['', Validators.required],
    dataFimJanela: ['', Validators.required],
    horaFimJanela: ['', Validators.required],
    dataNecessidadeEntrega: ['', Validators.required],
    horaNecessidadeEntrega: ['', Validators.required],
    modal: ['', Validators.required],
    tipoVeiculo: ['', Validators.required],
    fluxo: ['', Validators.required],
    tipoMaterial: ['', Validators.required],
    altura: [''],
    comprimento: [''],
    largura: [''],
    peso: ['', Validators.required],
    volumetria: [''],
    permitirAgrupamento: [true],
    justificativa: ['', Validators.required],
    observacoes: ['']
  }, { validators: [dateTimeValidator, volumetriaValidator] });

  ngOnInit() {
    this.freteEdicaoId = this.route.snapshot.paramMap.get('id');
    if (this.freteEdicaoId) {
      this.carregarDadosEdicao(this.freteEdicaoId);
    } else {
      this.valoresAnteriores = { ...this.solicitacaoForm.value };
    }

    this.updateFilteredVeiculos();

    this.solicitacaoForm.get('peso')?.valueChanges.subscribe(() => {
      this.updateFilteredVeiculos();
    });
    this.solicitacaoForm.get('volumetria')?.valueChanges.subscribe(() => {
      this.updateFilteredVeiculos();
    });
    this.solicitacaoForm.get('modal')?.valueChanges.subscribe(() => {
      this.updateFilteredVeiculos();
    });
  }

  private carregarDadosEdicao(id: string) {
    const frete = this.freteService.getFreteById(id);
    if (frete) {
      this.solicitacaoGerada = true;
      
      const parseDateTime = (dateTimeStr?: string) => {
        if (!dateTimeStr) return { date: '', time: '' };
        const parts = dateTimeStr.split(' - ');
        return {
          date: parts[0] || '',
          time: parts[1] || ''
        };
      };

      const inicio = parseDateTime(frete.dataInicioJanela);
      const fim = parseDateTime(frete.dataFimJanela);
      const necessidade = parseDateTime(frete.dataNecessidadeEntrega);

      const dataValues = {
        ...frete,
        dataInicioJanela: inicio.date,
        horaInicioJanela: inicio.time,
        dataFimJanela: fim.date,
        horaFimJanela: fim.time,
        dataNecessidadeEntrega: necessidade.date,
        horaNecessidadeEntrega: necessidade.time,
        codUnidade: frete.unitCD
      };
      this.solicitacaoForm.patchValue(dataValues);
      this.updateFilteredVeiculos();
      this.valoresAnteriores = { ...this.solicitacaoForm.value };
      
      this.logsAlteracao = [
        { data: '12/06/2026', hora: '10:30', usuario: 'sistema@empresa.com', acao: 'Geração de Solicitação', detalhes: '' }
      ];
      this.snackBar.open(`Editando solicitação: ${id}`, 'Fechar', { duration: 3000 });
    }
  }

  voltar() {
    if (this.activeStep === 0) {
      this.router.navigate(['/home']);
    } else {
      this.activeStep--;
      this.stepper.previous();
    }
  }

  avancar() {
    if (this.activeStep < this.steps.length - 1) {
      this.activeStep++;
      this.stepper.next();
    }
  }

  onStepChange(event: any) {
    if (this.activeStep === 1 && this.cotacaoView) {
      this.sharedGroupedDemands = [...this.cotacaoView.groupedDemands];
      this.sharedVehicle = this.cotacaoView.aglutinadosTipoVeiculo;
    }
    this.activeStep = event.selectedIndex;
  }

  historico() {
    this.router.navigate(['/historico', this.freteEdicaoId || '21978']);
  }

  enviarParaAprovacao() {
    if (this.cotacaoView) {
      const hasGrouped = this.cotacaoView.groupedDemands.length > 0;
      const vehicleDefined = !!this.cotacaoView.aglutinadosTipoVeiculo;

      if (hasGrouped && !vehicleDefined) {
        this.dialog.open(ConfirmDialog, {
          width: '400px',
          data: {
            title: 'Atenção: Definição Obrigatória',
            message: 'O agrupamento de fretes exige a definição de um Tipo de Veículo. Por favor, atualize o campo no card de Fretes Aglutinados antes de prosseguir.',
            isAlert: true
          }
        });
        return;
      }

      this.sharedGroupedDemands = [...this.cotacaoView.groupedDemands];
      this.sharedVehicle = this.cotacaoView.aglutinadosTipoVeiculo;
    }

    this.avancar();
  }

  handleApproval(event: any) {
    this.sharedApprovedQuotation = event.approvedQuotation;
    this.sharedAprovadoresAtuais = event.aprovadoresAtuais;
    this.sharedUsuarioAprovador = event.usuarioAprovador;
    this.sharedTipoAprovacao = event.tipoAprovacao;
  }

  handleCobrancaSubmit(event: any) {
    this.sharedCobrancaExtra = event;
  }

  cancelarFreteExpresso() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Cancelar Frete Expresso',
        message: 'Deseja realmente cancelar este frete expresso? Todas as cotações associadas serão canceladas em cascata.'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        const currentFrete = this.getCurrentFrete();
        if (currentFrete && currentFrete.id !== 'A GERAR') {
          // Atualiza no service para Cancelado
          this.freteService.updateFrete(currentFrete.id, { 
            status: 'Cancelado', 
            etapa: 'Resumo' 
          });
        }
        this.snackBar.open('Frete Expresso e cotações associadas cancelados com sucesso.', 'Fechar', { duration: 3000 });
        this.router.navigate(['/home']);
      }
    });
  }

  getCurrentFrete(): Frete {
    const formValue = this.solicitacaoForm.value;
    const baseFrete = this.freteEdicaoId ? this.freteService.getFreteById(this.freteEdicaoId) : null;
    
    const defaultColeta = 'BRUNING (PANAMBI) - RUA DAS INDÚSTRIAS, 1500, DISTRITO INDUSTRIAL, SÃO PAULO - SP, CEP 04578-000';
    const defaultEntrega = 'CD CENTRAL LOGÍSTICA - AV. PRESIDENTE DUTRA, KM 210, BONSUCESSO, GUARULHOS - SP, CEP 07170-350';

    return {
      ...baseFrete,
      ...formValue,
      id: this.freteEdicaoId || 'A GERAR',
      solicitante: baseFrete?.solicitante || 'usuario.logado@empresa.com',
      dataCriacao: baseFrete?.dataCriacao || new Date().toISOString(),
      status: baseFrete?.status || 'Em andamento',
      etapa: baseFrete?.etapa || 'Cotações',
      unitCD: formValue.codUnidade,
      enderecoColeta: formValue.enderecoColeta || defaultColeta,
      enderecoEntrega: formValue.enderecoEntrega || defaultEntrega,
      dataInicioJanela: formValue.dataInicioJanela ? `${formValue.dataInicioJanela} - ${formValue.horaInicioJanela || ''}`.trim() : baseFrete?.dataInicioJanela,
      dataFimJanela: formValue.dataFimJanela ? `${formValue.dataFimJanela} - ${formValue.horaFimJanela || ''}`.trim() : baseFrete?.dataFimJanela,
      dataNecessidadeEntrega: formValue.dataNecessidadeEntrega ? `${formValue.dataNecessidadeEntrega} - ${formValue.horaNecessidadeEntrega || ''}`.trim() : baseFrete?.dataNecessidadeEntrega,
      permitirAgrupamento: formValue.permitirAgrupamento !== undefined ? formValue.permitirAgrupamento : baseFrete?.permitirAgrupamento,
    } as Frete;
  }

  onSubmit() {
    if (this.solicitacaoForm.valid) {
      if (!this.solicitacaoGerada) {
        const dialogRef = this.dialog.open(ConfirmDialog, {
          width: '350px',
          data: { 
            title: 'Confirmar Solicitação', 
            message: 'Deseja realmente gerar esta solicitação de frete expresso?' 
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.executarGeracao();
          }
        });
      } else {
        this.executarSalvamento();
      }
    } else {
      this.solicitacaoForm.markAllAsTouched();
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios.', 'Fechar', { duration: 3000 });
    }
  }

  private executarGeracao() {
    try {
      const currentFrete = this.getCurrentFrete();
      const novoFrete: Frete = {
        ...currentFrete,
        id: Math.floor(Math.random() * 10000).toString(),
        transportador: 'A Definir',
        solicitante: 'usuario.logado@empresa.com',
        status: 'Em Andamento',
        etapa: 'Cotações',
        distancia: 0,
        dataCriacao: new Date().toISOString()
      };
      
      this.freteService.addFrete(novoFrete);
      this.registrarLog('Geração de Solicitação');
      
      this.snackBar.open('salvo com sucesso, expectativa de retorno em até 40 minutos', 'Sucesso', { 
        duration: 3000, 
        panelClass: ['success-snackbar'] 
      });
      
      this.solicitacaoGerada = true;
      this.valoresAnteriores = { ...this.solicitacaoForm.value };
      
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 1500);
      
    } catch (error) {
      this.snackBar.open('Erro ao gerar solicitação. Tente novamente.', 'Erro', { duration: 4000 });
    }
  }

  private executarSalvamento() {
    try {
      const currentFrete = this.getCurrentFrete();
      if (this.freteEdicaoId) {
        this.freteService.updateFrete(this.freteEdicaoId, currentFrete);
      }

      const camposAlterados = this.getCamposAlterados();
      const detalhes = camposAlterados.length > 0 ? `Campos alterados: ${camposAlterados.join(', ')}` : 'Nenhuma alteração de valores';
      
      this.registrarLog('Alteração de Dados', detalhes);
      this.valoresAnteriores = { ...this.solicitacaoForm.value };
      
      this.snackBar.open('Alterações salvas com sucesso! O time operacional ILC foi notificado.', 'Sucesso', { 
        duration: 3000, 
        panelClass: ['success-snackbar'] 
      });
    } catch (error) {
      this.snackBar.open('Erro ao salvar alterações.', 'Erro', { duration: 4000 });
    }
  }

  private getCamposAlterados(): string[] {
    const currentValues = this.solicitacaoForm.value;
    const alteredFields: string[] = [];

    Object.keys(currentValues).forEach(key => {
      if (currentValues[key] !== this.valoresAnteriores[key]) {
        alteredFields.push(this.fieldLabels[key] || key);
      }
    });

    return alteredFields;
  }

  private registrarLog(acao: string, detalhes: string = '') {
    const log = {
      data: new Date().toLocaleDateString('pt-BR'),
      hora: new Date().toLocaleTimeString('pt-BR'),
      usuario: 'usuario.logado@empresa.com',
      acao: acao,
      detalhes: detalhes
    };
    this.logsAlteracao = [log, ...this.logsAlteracao];
  }

  openSearchModal(type: 'cliente' | 'fornecedor') {
    const titles = {
      cliente: 'Pesquisar Cliente',
      fornecedor: 'Pesquisar Fornecedor'
    };

    const dialogRef = this.dialog.open(SearchModal, {
      width: '1000px',
      maxWidth: '95vw',
      data: { title: titles[type], type }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (type === 'cliente') {
          this.solicitacaoForm.patchValue({ cliente: result });
          const match = result.match(/\(([^)]+)\)$/);
          if (match && match[1]) {
            this.solicitacaoForm.patchValue({ codUnidade: match[1] });
          }
        }
        if (type === 'fornecedor') this.solicitacaoForm.patchValue({ fornecedor: result });
      }
    });
  }

  openAddressModal(type: 'coleta' | 'entrega') {
    const fieldName = type === 'coleta' ? 'enderecoColeta' : 'enderecoEntrega';
    const currentValue = this.solicitacaoForm.get(fieldName)?.value || '';

    const dialogRef = this.dialog.open(AddressModal, {
      width: '600px',
      maxWidth: '95vw',
      data: { address: currentValue }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.solicitacaoForm.patchValue({ [fieldName]: result });
        this.solicitacaoForm.get(fieldName)?.markAsDirty();
      }
    });
  }

  updateFilteredVeiculos() {
    const pesoRaw = this.solicitacaoForm.get('peso')?.value;
    const volRaw = this.solicitacaoForm.get('volumetria')?.value;
    const modal = this.solicitacaoForm.get('modal')?.value as string;

    // Treat empty/null/NaN as 0
    const peso = (pesoRaw !== null && pesoRaw !== '' && !isNaN(Number(pesoRaw))) ? Number(pesoRaw) : 0;
    const volumetria = (volRaw !== null && volRaw !== '' && !isNaN(Number(volRaw))) ? Number(volRaw) : 0;

    // Filter by peso/volumetria first
    let filtered = this.veiculos.filter(v => v.pesoMax >= peso && v.volumetriaMax >= volumetria);

    // Apply modal constraint
    if (modal === 'Aéreo') {
      // Only Aéreo allowed
      filtered = filtered.filter(v => v.value === 'Aéreo');
    } else if (modal === 'Rodoviário') {
      // Exclude Aéreo
      filtered = filtered.filter(v => v.value !== 'Aéreo');
    }

    this.filteredVeiculos = filtered;

    // If current selection is no longer compatible, clear it
    const currentValue = this.solicitacaoForm.get('tipoVeiculo')?.value;
    if (currentValue && currentValue !== '') {
      const isStillCompatible = this.filteredVeiculos.some(v => v.value === currentValue);
      if (!isStillCompatible) {
        this.solicitacaoForm.patchValue({ tipoVeiculo: '' }, { emitEvent: false });
      }
    }
  }

  preencherAleatoriamente() {
    const mock = this.freteService.randomizeMockFrete();
    this.solicitacaoForm.patchValue({
      fornecedor: mock.fornecedor,
      codUnidade: mock.unitCD,
      cliente: mock.cliente,
      enderecoColeta: mock.enderecoColeta,
      enderecoEntrega: mock.enderecoEntrega,
      dataInicioJanela: mock.dataInicioJanela.split(' - ')[0],
      horaInicioJanela: mock.dataInicioJanela.split(' - ')[1],
      dataFimJanela: mock.dataFimJanela.split(' - ')[0],
      horaFimJanela: mock.dataFimJanela.split(' - ')[1],
      dataNecessidadeEntrega: mock.dataNecessidadeEntrega.split(' - ')[0],
      horaNecessidadeEntrega: mock.dataNecessidadeEntrega.split(' - ')[1],
      modal: mock.modal,
      tipoVeiculo: mock.tipoVeiculo,
      fluxo: mock.fluxo,
      tipoMaterial: mock.tipoMaterial,
      altura: mock.altura,
      comprimento: mock.comprimento,
      largura: mock.largura,
      peso: mock.peso,
      volumetria: mock.volumetria,
      permitirAgrupamento: mock.permitirAgrupamento,
      justificativa: mock.justificativa,
      observacoes: mock.observacoes
    });
    this.solicitacaoForm.markAllAsTouched();
    this.snackBar.open('Formulário preenchido com dados aleatórios válidos!', 'Fechar', { duration: 3000 });
  }
}

// Group-level validator: returns only group errors, does NOT call setErrors on children
// (calling setErrors on children from a group validator causes infinite loops)
export function dateTimeValidator(group: FormGroup): { [key: string]: boolean } | null {
  const dataInicio = group.get('dataInicioJanela')?.value as string;
  const horaInicio = group.get('horaInicioJanela')?.value as string;
  const dataFim    = group.get('dataFimJanela')?.value as string;
  const horaFim    = group.get('horaFimJanela')?.value as string;
  const dataNec    = group.get('dataNecessidadeEntrega')?.value as string;
  const horaNec    = group.get('horaNecessidadeEntrega')?.value as string;

  const toDate = (d: string, t: string): Date | null => {
    if (!d || !t) return null;
    const p = d.split('-');
    const tp = t.split(':');
    if (p.length !== 3 || tp.length < 2) return null;
    const dt = new Date(+p[0], +p[1] - 1, +p[2], +tp[0], +tp[1], 0, 0);
    return isNaN(dt.getTime()) ? null : dt;
  };

  const inicio     = toDate(dataInicio, horaInicio);
  const fim        = toDate(dataFim, horaFim);
  const necessidade = toDate(dataNec, horaNec);
  const agora      = new Date();

  const errors: { [key: string]: boolean } = {};

  // Rule 1: Início janela must be >= now + 1h30m
  if (inicio && (inicio.getTime() - agora.getTime()) < 5400000) {
    errors['inicioMinHoraAgora'] = true;
  }

  // Rule 2: Fim janela must be >= início + 1h
  if (inicio && fim && (fim.getTime() - inicio.getTime()) < 3600000) {
    errors['inicioFimMinDiferenca'] = true;
  }

  // Rule 3: Necessidade must be >= fim + 1h
  if (fim && necessidade && (necessidade.getTime() - fim.getTime()) < 3600000) {
    errors['fimNecMinDiferenca'] = true;
  }

  return Object.keys(errors).length ? errors : null;
}

// Validates that altura × largura × comprimento equals the informed volumetria (when all three dimensions are filled)
export function volumetriaValidator(group: FormGroup): { [key: string]: any } | null {
  const alturaRaw    = group.get('altura')?.value;
  const comprRaw     = group.get('comprimento')?.value;
  const largRaw      = group.get('largura')?.value;
  const volRaw       = group.get('volumetria')?.value;

  const toNum = (v: any): number | null => {
    if (v === null || v === '' || v === undefined) return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
  };

  const h = toNum(alturaRaw);
  const c = toNum(comprRaw);
  const l = toNum(largRaw);
  const vol = toNum(volRaw);

  // Only validate when all three dimensions AND volumetria are informed
  if (h === null || c === null || l === null || vol === null) return null;

  const calculated = Math.round(h * c * l * 1000) / 1000; // round to 3 decimal places
  const informed   = Math.round(vol * 1000) / 1000;
  const diff       = Math.round((calculated - informed) * 1000) / 1000;

  // Allow a small floating-point tolerance of 0.001 m³
  if (Math.abs(diff) > 0.001) {
    return {
      volumetriaMismatch: { calculated, informed, diff }
    };
  }

  return null;
}

