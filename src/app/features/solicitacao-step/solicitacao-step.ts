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

  solicitacaoGerada = false;
  logsAlteracao: any[] = [];
  freteEdicaoId: string | null = null;
  valoresAnteriores: any = {};

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
  });

  ngOnInit() {
    this.freteEdicaoId = this.route.snapshot.paramMap.get('id');
    if (this.freteEdicaoId) {
      this.carregarDadosEdicao(this.freteEdicaoId);
    } else {
      this.valoresAnteriores = { ...this.solicitacaoForm.value };
    }
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

  getCurrentFrete(): Frete {
    const formValue = this.solicitacaoForm.value;
    const baseFrete = this.freteEdicaoId ? this.freteService.getFreteById(this.freteEdicaoId) : this.mockFrete;
    
    const defaultColeta = 'FORNECEDOR ALFA S.A. - RUA DAS INDÚSTRIAS, 1500, DISTRITO INDUSTRIAL, SÃO PAULO - SP, CEP 04578-000';
    const defaultEntrega = 'CD CENTRAL LOGÍSTICA - AV. PRESIDENTE DUTRA, KM 210, BONSUCESSO, GUARULHOS - SP, CEP 07170-350';

    return {
      ...baseFrete,
      ...formValue,
      id: this.freteEdicaoId || 'A GERAR',
      unitCD: formValue.codUnidade,
      enderecoColeta: formValue.enderecoColeta || defaultColeta,
      enderecoEntrega: formValue.enderecoEntrega || defaultEntrega,
      dataInicioJanela: formValue.dataInicioJanela ? `${formValue.dataInicioJanela} ${formValue.horaInicioJanela || ''}`.trim() : baseFrete?.dataInicioJanela,
      dataFimJanela: formValue.dataFimJanela ? `${formValue.dataFimJanela} ${formValue.horaFimJanela || ''}`.trim() : baseFrete?.dataFimJanela,
      dataNecessidadeEntrega: formValue.dataNecessidadeEntrega ? `${formValue.dataNecessidadeEntrega} ${formValue.horaNecessidadeEntrega || ''}`.trim() : baseFrete?.dataNecessidadeEntrega,
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
      const formValue = this.solicitacaoForm.value;
      const novoFrete: Frete = {
        ...formValue,
        id: Math.floor(Math.random() * 10000).toString(),
        transportador: 'A Definir',
        solicitante: 'usuario.logado@empresa.com',
        status: 'Pendente',
        etapa: 'Cotação Aprovação',
        distancia: 0,
        unitCD: formValue.codUnidade,
        dataCriacao: new Date().toISOString()
      };
      
      this.freteService.addFrete(novoFrete);
      this.registrarLog('Geração de Solicitação');
      
      this.snackBar.open('Solicitação gerada com sucesso!', 'Sucesso', { 
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
      const camposAlterados = this.getCamposAlterados();
      const detalhes = camposAlterados.length > 0 ? `Campos alterados: ${camposAlterados.join(', ')}` : 'Nenhuma alteração de valores';
      
      this.registrarLog('Alteração de Dados', detalhes);
      this.valoresAnteriores = { ...this.solicitacaoForm.value };
      
      this.snackBar.open('Alterações salvas com sucesso!', 'Sucesso', { 
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
        if (type === 'cliente') this.solicitacaoForm.patchValue({ cliente: result });
        if (type === 'fornecedor') this.solicitacaoForm.patchValue({ fornecedor: result });
      }
    });
  }
}
