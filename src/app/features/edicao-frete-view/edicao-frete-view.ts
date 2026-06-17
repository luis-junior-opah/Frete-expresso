import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FreteService } from '../../core/services/frete.service';
import { Frete } from '../../core/models/frete.model';

@Component({
  selector: 'app-edicao-frete-view',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatSelectModule, 
    MatButtonModule, 
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './edicao-frete-view.html',
  styleUrls: ['./edicao-frete-view.css']
})
export class EdicaoFreteView implements OnInit {
  private fb = inject(FormBuilder);
  private freteService = inject(FreteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  frete: Frete | undefined;
  
  // Dados simulados para a segunda demanda em caso de agrupamento
  segundaDemanda: any = {
    id: '101',
    fornecedor: 'FORNECEDOR ALFA S.A.',
    enderecoColeta: 'RUA DAS INDÚSTRIAS, 1500, SÃO PAULO - SP',
    cliente: 'CLIENTE LOGÍSTICA X',
    enderecoEntrega: 'CD CENTRAL - ESTRADA DO CAMINHO, 500, GUARULHOS - SP',
    dataInicioJanela: '16/06/2026 07:00',
    dataFimJanela: '16/06/2026 11:00',
    dataNecessidadeEntrega: '17/06/2026 14:00',
    modal: 'Rodoviário',
    tipoVeiculo: 'Truck Aberto',
    fluxo: 'Fabrica',
    tipoMaterial: 'Direto',
    justificativa: 'Agrupamento para otimização de custo e TT.',
    observacoes: 'Urgente',
    altura: 1.2,
    comprimento: 1.5,
    largura: 1.0,
    volumetria: 1.8,
    peso: 450
  };

  // Valores fixos do "outro frete" para exibição em modalidade agrupada
  valoresOutroFrete = {
    ttColeta: 24,
    ttEntrega: 48,
    valor: 8500
  };

  cotacaoForm: FormGroup = this.fb.group({
    transportadora: ['', Validators.required],
    // Individual
    ttColetaIndividual: ['', Validators.required],
    ttEntregaIndividual: ['', Validators.required],
    valorIndividual: ['', Validators.required],
    // Complementar (Aglutinado)
    ttColetaComplementar: [''],
    ttEntregaComplementar: [''],
    valorComplementar: [''],
    observacao: ['']
  });

  cobrancaExtraForm: FormGroup = this.fb.group({
    motivo: ['', Validators.required],
    valor: ['', [Validators.required, Validators.min(0.01)]],
    descricaoMotivo: ['']
  });

  isAgrupado = false;
  infoAuditoria: { usuario: string; dataHora: string; acao: string } | null = null;
  camposDesabilitados = false;

  @ViewChild('confirmEnvioDialog') confirmEnvioDialog!: TemplateRef<any>;
  @ViewChild('confirmDeclinarDialog') confirmDeclinarDialog!: TemplateRef<any>;
  @ViewChild('confirmCorrecaoDialog') confirmCorrecaoDialog!: TemplateRef<any>;
  @ViewChild('cobrarAdicionalDialog') cobrarAdicionalDialog!: TemplateRef<any>;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.frete = this.freteService.getFreteById(id);
      
      this.isAgrupado = this.frete?.id === '21978' || !!this.frete?.aglutinadorId;

      if (this.isAgrupado) {
        this.cotacaoForm.get('ttColetaComplementar')?.setValidators([Validators.required]);
        this.cotacaoForm.get('ttEntregaComplementar')?.setValidators([Validators.required]);
        this.cotacaoForm.get('valorComplementar')?.setValidators([Validators.required]);
      }

      if (this.frete && this.frete.cotacao) {
        this.cotacaoForm.patchValue({
          transportadora: this.frete.cotacao.transportadoraId || this.frete.transportador,
          valorIndividual: this.frete.cotacao.cotacaoIndividual,
          ttColetaIndividual: this.frete.cotacao.transitTimeColeta,
          ttEntregaIndividual: this.frete.cotacao.transitTimeEntrega,
          valorComplementar: 1200, 
          ttColetaComplementar: 12,
          ttEntregaComplementar: 24
        });
      } else if (this.frete) {
        this.cotacaoForm.patchValue({
          transportadora: this.frete.transportador
        });
      }
    }
  }

  // Getters para cálculos automáticos de totais
  get totalTTColeta(): number {
    return this.valoresOutroFrete.ttColeta + (Number(this.cotacaoForm.get('ttColetaComplementar')?.value) || 0);
  }

  get totalTTEntrega(): number {
    return this.valoresOutroFrete.ttEntrega + (Number(this.cotacaoForm.get('ttEntregaComplementar')?.value) || 0);
  }

  get totalValor(): number {
    return this.valoresOutroFrete.valor + (Number(this.cotacaoForm.get('valorComplementar')?.value) || 0);
  }

  get pesoCubado(): number {
    if (!this.frete) return 0;
    const h = this.frete.altura || 0;
    const l = this.frete.largura || 0;
    const c = this.frete.comprimento || 0;
    return (h * l * c) * 300;
  }

  get totalVolumetria(): number {
    const vol1 = this.frete?.volumetria || 0;
    const vol2 = this.isAgrupado ? (this.segundaDemanda.volumetria || 0) : 0;
    return vol1 + vol2;
  }

  get totalPeso(): number {
    const peso1 = this.frete?.peso || 0;
    const peso2 = this.isAgrupado ? (this.segundaDemanda.peso || 0) : 0;
    return peso1 + peso2;
  }

  get totalPesoCubado(): number {
    const p1 = this.pesoCubado;
    let p2 = 0;
    if (this.isAgrupado) {
      const h = this.segundaDemanda.altura || 0;
      const c = this.segundaDemanda.comprimento || 0;
      const l = this.segundaDemanda.largura || 0;
      p2 = (h * c * l) * 300;
    }
    return p1 + p2;
  }

  voltar() {
    this.router.navigate(['/home']);
  }

  handleEnviarCotacao() {
    this.dialog.open(this.confirmEnvioDialog);
  }

  confirmarEnvio() {
    if (this.cotacaoForm.valid && this.frete) {
      const val = this.cotacaoForm.value;
      const dataHora = new Date().toLocaleString('pt-BR');
      
      this.freteService.submeterCotacao(this.frete.id, {
        cotacaoIndividual: parseFloat(val.valorIndividual) || 0,
        transitTimeColeta: parseInt(val.ttColetaIndividual) || 0,
        transitTimeEntrega: parseInt(val.ttEntregaIndividual) || 0,
        transportadoraId: val.transportadora,
        dataSubmissao: dataHora,
        usuarioSubmissao: 'usuario@transportadora.com'
      });

      this.infoAuditoria = {
        usuario: 'usuario@transportadora.com',
        dataHora: dataHora,
        acao: 'Cotação enviada'
      };

      this.camposDesabilitados = true;
      this.cotacaoForm.disable();
      this.frete = this.freteService.getFreteById(this.frete.id);
      this.dialog.closeAll();
      this.snackBar.open('Cotação enviada com sucesso!', 'Fechar', { duration: 3000, panelClass: ['success-snackbar'] });
    }
  }

  handleDeclinarClick() {
    this.dialog.open(this.confirmDeclinarDialog);
  }

  confirmarDeclinar() {
    if (this.frete) {
      const dataHora = new Date().toLocaleString('pt-BR');
      this.freteService.updateFrete(this.frete.id, { status: 'Cancelado', etapa: 'Cotações' });
      
      this.infoAuditoria = {
        usuario: 'usuario@transportadora.com',
        dataHora: dataHora,
        acao: 'Cotação declinada'
      };

      this.camposDesabilitados = true;
      this.cotacaoForm.disable();
      this.frete = this.freteService.getFreteById(this.frete.id);
      this.dialog.closeAll();
      this.snackBar.open('Cotação declinada com sucesso!', 'Fechar', { duration: 3000 });
    }
  }

  handleSolicitarCorrecao() {
    this.dialog.open(this.confirmCorrecaoDialog);
  }

  confirmarCorrecao() {
    if (this.frete) {
      const dataHora = new Date().toLocaleString('pt-BR');
      this.infoAuditoria = {
        usuario: 'usuario@transportadora.com',
        dataHora: dataHora,
        acao: 'Correção solicitada'
      };
      this.dialog.closeAll();
      this.snackBar.open('Solicitação de correção enviada!', 'Fechar', { duration: 3000 });
    }
  }

  handleCobrarAdicional() {
    this.dialog.open(this.cobrarAdicionalDialog);
  }

  confirmarCobrancaExtra() {
    if (this.cobrancaExtraForm.valid && this.frete) {
      const val = this.cobrancaExtraForm.value;
      const dataHora = new Date().toLocaleString('pt-BR');
      
      this.infoAuditoria = {
        usuario: 'usuario@transportadora.com',
        dataHora: dataHora,
        acao: `Cobrança extra submetida (${val.motivo}: R$ ${val.valor})`
      };

      this.dialog.closeAll();
      this.snackBar.open('Cobrança extra submetida com sucesso!', 'Fechar', { duration: 3000, panelClass: ['success-snackbar'] });
    }
  }

  cancelarDialog() {
    this.dialog.closeAll();
  }
}
