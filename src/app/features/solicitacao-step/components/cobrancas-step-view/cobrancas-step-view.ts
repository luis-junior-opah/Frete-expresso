import { Component, Input, inject, signal, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { SolicitacaoCard } from '../solicitacao-card/solicitacao-card';
import { Frete } from '../../../../core/models/frete.model';

@Component({
  selector: 'app-cobrancas-step-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    SolicitacaoCard
  ],
  templateUrl: './cobrancas-step-view.html',
  styleUrl: './cobrancas-step-view.css',
})
export class CobrancasStepView {
  @Input() frete?: Frete;
  @Input() approvedQuotation: any = null;
  @Input() groupedDemands: any[] = [];
  @Input() aglutinadosTipoVeiculo = '';
  @Output() onCobrancaSubmit = new EventEmitter<any>();

  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Form states
  cobrancaSubmetida = signal(false);
  cobrancaStatus = signal<'Pendente' | 'Aprovado' | 'Recusado'>('Pendente');

  tipoOcorrencia = '';
  valorComplemento: number | null = null;
  justificativa = '';
  nomeArquivoEvidencia = '';
  anexoValido = true;

  ocorrenciasList = [
    { value: 'HORAS_PARADAS', label: 'Horas Paradas - Espera em carga/descarga' },
    { value: 'DIARIA', label: 'Diária Excedente - Diária de motorista' },
    { value: 'DESCARGA', label: 'Taxa de Descarga - Serviço operacional' },
    { value: 'TROCA_VEICULO', label: 'Troca de Veículo - Defeito/Sinistro' }
  ];

  // Matriz de alçadas ativada especificamente para o delta (valor_delta_solicitado)
  aprovadoresAlcada = [
    { nome: 'Ricardo Santos', email: 'ricardo.santos@empresa.com', funcao: 'Coordenador Logístico', ativo: true },
    { nome: 'Juliana Mendes', email: 'juliana.mendes@empresa.com', funcao: 'Gerente Operacional', ativo: false }
  ];

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const maxSizeBytes = 25 * 1024 * 1024; // 25MB

    if (file.size > maxSizeBytes) {
      input.value = '';
      this.nomeArquivoEvidencia = '';
      this.anexoValido = false;
      this.snackBar.open(`O arquivo "${file.name}" excede o limite de 25MB`, 'Fechar', {
        duration: 5000,
        panelClass: ['premium-toast-error'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    this.anexoValido = true;
    this.nomeArquivoEvidencia = file.name;
    this.snackBar.open('Arquivo anexado com sucesso!', 'OK', { duration: 3000 });
  }

  submitCobranca() {
    if (!this.tipoOcorrencia) {
      this.snackBar.open('Selecione o tipo de ocorrência.', 'Fechar', { duration: 3000 });
      return;
    }
    if (!this.valorComplemento || this.valorComplemento <= 0) {
      this.snackBar.open('Informe um valor de cobrança válido.', 'Fechar', { duration: 3000 });
      return;
    }
    if (!this.justificativa || this.justificativa.length < 15) {
      this.snackBar.open('A justificativa operacional deve ter pelo menos 15 caracteres.', 'Fechar', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Confirmar Cobrança',
        message: 'Deseja realmente solicitar esta cobrança complementar de custo?'
      }
    });

    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) {
        this.cobrancaSubmetida.set(true);
        this.cobrancaStatus.set('Pendente');
        
        // Ativar alçada de aprovação com base no valor
        if (this.valorComplemento! > 5000) {
          this.aprovadoresAlcada[1].ativo = true; // Gerente também precisa atuar
        }

        this.onCobrancaSubmit.emit({
          tipoOcorrencia: this.tipoOcorrencia,
          valor: this.valorComplemento,
          justificativa: this.justificativa,
          status: 'Pendente',
          arquivo: this.nomeArquivoEvidencia
        });

        this.snackBar.open('Cobrança complementar enviada para aprovação na Matriz de Alçadas!', 'Sucesso', { duration: 4000 });
      }
    });
  }

  aprovarCusto() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Aprovar Cobrança Complementar',
        message: `Deseja aprovar o valor extra de R$ ${this.valorComplemento?.toFixed(2)} referente a ocorrência ${this.tipoOcorrencia}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cobrancaStatus.set('Aprovado');
        this.onCobrancaSubmit.emit({
          tipoOcorrencia: this.tipoOcorrencia,
          valor: this.valorComplemento,
          justificativa: this.justificativa,
          status: 'Aprovado',
          arquivo: this.nomeArquivoEvidencia
        });
        this.snackBar.open('Cobrança complementar Aprovada com sucesso!', 'Fechar', { duration: 3000 });
      }
    });
  }

  recusarCusto() {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Recusar Cobrança Complementar',
        message: 'Deseja realmente recusar esta solicitação de cobrança complementar?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cobrancaStatus.set('Recusado');
        this.onCobrancaSubmit.emit({
          tipoOcorrencia: this.tipoOcorrencia,
          valor: this.valorComplemento,
          justificativa: this.justificativa,
          status: 'Recusado',
          arquivo: this.nomeArquivoEvidencia
        });
        this.snackBar.open('Cobrança complementar Recusada com sucesso.', 'Fechar', { duration: 3000 });
      }
    });
  }
}
