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
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatSnackBarModule,
    MatTooltipModule
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
  
  // Lista dinâmica para todas as demandas adicionais do grupo
  demandasAgrupadas: Frete[] = [];

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

  cobrancaArquivoAnexado: string | null = null;
  propostaArquivoAnexado: string | null = null;
  historicoAlteracoes: any[] = [];

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
      this.historicoAlteracoes = this.frete?.historico || [];
      this.camposDesabilitados = this.frete?.etapa !== 'Cotações' || this.frete?.status === 'Em Aprovação';

      if (this.isAgrupado && this.frete) {
        // Mock: Se for o frete de teste principal (21978), garante o vínculo dinâmico com outro frete
        const aglutinadorId = this.frete.aglutinadorId || 'AG-MOCK-21978';
        if (!this.frete.aglutinadorId) {
          this.frete.aglutinadorId = aglutinadorId;
          const outro = this.freteService.fretes().find(f => f.id === '22001');
          if (outro) {
            outro.aglutinadorId = aglutinadorId;
          }
        }

        // Carrega todas as outras demandas agrupadas no mesmo lote
        this.demandasAgrupadas = this.freteService.fretes().filter(
          f => f.aglutinadorId === this.frete?.aglutinadorId && f.id !== this.frete?.id
        );

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
          valorComplementar: this.frete.cotacao.cotacaoComplementar || 1200, 
          ttColetaComplementar: this.frete.cotacao.transitTimeColeta || 12,
          ttEntregaComplementar: this.frete.cotacao.transitTimeEntrega || 24
        });
      } else if (this.frete) {
        this.cotacaoForm.patchValue({
          transportadora: this.frete.transportador,
          // Prefill com valores padrão se for agrupado para que o formulário fique válido e o envio funcione
          valorComplementar: this.isAgrupado ? 1200 : '',
          ttColetaComplementar: this.isAgrupado ? 12 : '',
          ttEntregaComplementar: this.isAgrupado ? 24 : ''
        });
      }

      if (this.camposDesabilitados) {
        this.cotacaoForm.disable();
      }
    }
  }

  // Métodos auxiliares para parse e comparação de datas de mock
  private parseMockDateTime(dateTimeStr?: string): Date | null {
    if (!dateTimeStr) return null;
    
    if (dateTimeStr.includes(' - ')) {
      const parts = dateTimeStr.split(' - ');
      const dParts = parts[0].split('-');
      const tParts = (parts[1] || '00:00').split(':');
      return new Date(+dParts[0], +dParts[1] - 1, +dParts[2], +tParts[0], +tParts[1]);
    }
    
    if (dateTimeStr.includes('/')) {
      const parts = dateTimeStr.split(' ');
      const dParts = parts[0].split('/');
      const tParts = (parts[1] || '00:00').split(':');
      return new Date(+dParts[2], +dParts[1] - 1, +dParts[0], +tParts[0], +tParts[1]);
    }

    const d = new Date(dateTimeStr);
    return isNaN(d.getTime()) ? null : d;
  }

  private formatarDataMock(date: Date): string {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} - ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  get todasDemandas(): Frete[] {
    if (!this.frete) return [];
    return [this.frete, ...this.demandasAgrupadas];
  }

  get valoresOutroFrete() {
    if (this.demandasAgrupadas.length > 0) {
      const outra = this.demandasAgrupadas[0];
      return {
        ttColeta: outra.cotacao?.transitTimeColeta || 24,
        ttEntrega: outra.cotacao?.transitTimeEntrega || 48,
        valor: outra.cotacao?.cotacaoIndividual || 8500
      };
    }
    return {
      ttColeta: 24,
      ttEntrega: 48,
      valor: 8500
    };
  }

  // Getters para consolidação dinâmica de janelas do grupo
  get dataInicioJanelaConsolidada(): string {
    const datas = this.todasDemandas
      .map(d => this.parseMockDateTime(d.dataInicioJanela))
      .filter((d): d is Date => d !== null);
    
    if (datas.length === 0) return this.frete?.dataInicioJanela || '';
    const minDate = new Date(Math.min(...datas.map(d => d.getTime())));
    return this.formatarDataMock(minDate);
  }

  get dataFimJanelaConsolidada(): string {
    const datas = this.todasDemandas
      .map(d => this.parseMockDateTime(d.dataFimJanela))
      .filter((d): d is Date => d !== null);
    
    if (datas.length === 0) return this.frete?.dataFimJanela || '';
    const maxDate = new Date(Math.max(...datas.map(d => d.getTime())));
    return this.formatarDataMock(maxDate);
  }

  get dataNecessidadeEntregaConsolidada(): string {
    const datas = this.todasDemandas
      .map(d => this.parseMockDateTime(d.dataNecessidadeEntrega))
      .filter((d): d is Date => d !== null);
    
    if (datas.length === 0) return this.frete?.dataNecessidadeEntrega || '';
    const minDate = new Date(Math.min(...datas.map(d => d.getTime())));
    return this.formatarDataMock(minDate);
  }

  // Getters para cálculos automáticos de totais
  get totalTTColeta(): number {
    const ttColetaInd = Number(this.cotacaoForm.get('ttColetaIndividual')?.value) || 0;
    const ttColetaComp = Number(this.cotacaoForm.get('ttColetaComplementar')?.value) || 0;
    return ttColetaInd + ttColetaComp;
  }

  get totalTTEntrega(): number {
    const ttEntregaInd = Number(this.cotacaoForm.get('ttEntregaIndividual')?.value) || 0;
    const ttEntregaComp = Number(this.cotacaoForm.get('ttEntregaComplementar')?.value) || 0;
    return ttEntregaInd + ttEntregaComp;
  }

  get totalValor(): number {
    const valorInd = Number(this.cotacaoForm.get('valorIndividual')?.value) || 0;
    const valorComp = Number(this.cotacaoForm.get('valorComplementar')?.value) || 0;
    return valorInd + valorComp;
  }

  get pesoCubado(): number {
    if (!this.frete) return 0;
    const h = this.frete.altura || 0;
    const l = this.frete.largura || 0;
    const c = this.frete.comprimento || 0;
    return (h * l * c) * 300;
  }

  get totalVolumetria(): number {
    return this.todasDemandas.reduce((sum, d) => sum + (d.volumetria || 0), 0);
  }

  get totalPeso(): number {
    return this.todasDemandas.reduce((sum, d) => sum + (d.peso || 0), 0);
  }

  get totalPesoCubado(): number {
    return this.todasDemandas.reduce((sum, d) => {
      const h = d.altura || 0;
      const c = d.comprimento || 0;
      const l = d.largura || 0;
      return sum + ((h * c * l) * 300);
    }, 0);
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
        cotacaoComplementar: parseFloat(val.valorComplementar) || 0,
        transitTimeColeta: parseInt(val.ttColetaIndividual) || 0,
        transitTimeEntrega: parseInt(val.ttEntregaIndividual) || 0,
        transportadoraId: val.transportadora,
        dataSubmissao: dataHora,
        usuarioSubmissao: 'usuario@transportadora.com'
      });

      this.adicionarHistorico(`Cotação enviada (Individual R$ ${val.valorIndividual}${val.valorComplementar ? ' | Complementar R$ ' + val.valorComplementar : ''})`);

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
      this.adicionarHistorico('Cotação declinada');
      
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
      this.adicionarHistorico('Correção solicitada');

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
    this.cobrancaExtraForm.reset({
      motivo: '',
      valor: '',
      descricaoMotivo: ''
    });
    this.cobrancaArquivoAnexado = null;
    this.dialog.open(this.cobrarAdicionalDialog);
  }

  onCobrancaFileSelected(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      this.cobrancaArquivoAnexado = files[0].name;
      this.snackBar.open(`Arquivo ${files[0].name} anexado com sucesso!`, 'Fechar', { duration: 3000 });
    }
  }

  onPropostaFileSelected(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      this.propostaArquivoAnexado = files[0].name;
      this.adicionarHistorico(`Proposta comercial anexada: ${files[0].name}`);
      this.snackBar.open(`Proposta comercial ${files[0].name} anexada com sucesso!`, 'Fechar', { duration: 3000 });
    }
  }

  confirmarCobrancaExtra() {
    if (this.cobrancaExtraForm.valid && this.frete) {
      const val = this.cobrancaExtraForm.value;
      const dataHora = new Date().toLocaleString('pt-BR');
      
      const fileText = this.cobrancaArquivoAnexado ? ` | Arquivo: ${this.cobrancaArquivoAnexado}` : '';
      this.adicionarHistorico(`Cobrança extra submetida (${val.motivo}: R$ ${val.valor}${fileText})`);

      this.infoAuditoria = {
        usuario: 'usuario@transportadora.com',
        dataHora: dataHora,
        acao: `Cobrança extra submetida (${val.motivo}: R$ ${val.valor}${fileText})`
      };

      this.dialog.closeAll();
      this.snackBar.open('Cobrança extra submetida com sucesso!', 'Fechar', { duration: 3000, panelClass: ['success-snackbar'] });
    }
  }

  adicionarHistorico(acao: string) {
    const dataHora = new Date().toLocaleString('pt-BR');
    const item = {
      usuario: 'usuario@transportadora.com',
      dataHora: dataHora,
      acao: acao
    };
    
    if (this.frete) {
      const currentHist = this.frete.historico || [];
      const updatedHist = [...currentHist, item];
      this.frete.historico = updatedHist;
      this.freteService.updateFrete(this.frete.id, { historico: updatedHist });
      this.historicoAlteracoes = updatedHist;
    }
  }

  cancelarDialog() {
    this.dialog.closeAll();
  }
}
