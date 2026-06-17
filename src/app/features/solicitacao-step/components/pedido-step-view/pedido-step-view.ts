import { Component, Input, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SolicitacaoCard } from '../solicitacao-card/solicitacao-card';
import { Frete } from '../../../../core/models/frete.model';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-pedido-observacao-modal',
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
export class PedidoObservacaoModal {
  data = inject(MAT_DIALOG_DATA);
}

@Component({
  selector: 'app-pedido-step-view',
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
    MatDialogModule,
    MatTableModule,
    MatSelectModule,
    MatTooltipModule,
    SolicitacaoCard
  ],
  templateUrl: './pedido-step-view.html',
  styleUrl: './pedido-step-view.css',
})
export class PedidoStepView {
  @Input() frete?: Frete;
  @Input() approvedQuotation: any = null;
  @Input() groupedDemands: any[] = [];
  @Input() aglutinadosTipoVeiculo = '';

  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  ondeColeta = 'ARIANA-CAMPINAS';
  numeroColeta = '';
  
  justificativaValidacao = 'Aprovação realizada conforme alinhamento com a gerência de suprimentos para atender pedido crítico.';
  
  pedidoGerado = false;
  numeroPedidoGerado = '';
  coletaGerada = false;
  numeroColetaGerado = '';
  logsAlteracao: any[] = [];

  aglutinadosColumns: string[] = [
    'ag_id', 'ag_pedido', 'ag_fornecedor', 'ag_localColeta', 
    'ag_distancia', 'ag_inicioJanela', 'ag_fimJanela', 
    'ag_necessidadeEntrega', 'ag_modal', 'ag_tipoVeiculo', 'ag_fluxo', 
    'ag_tipoMaterial', 'ag_altura', 'ag_comprimento', 'ag_largura', 'ag_peso', 
    'ag_volumetria', 'ag_solicitante', 'ag_dataCriacao', 'ag_observacoes'
  ];

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
    this.dialog.open(PedidoObservacaoModal, {
      data: obs,
      width: '500px'
    });
  }

  gerarPedido() {
    const transportadora = this.approvedQuotation?.transportadora || 'Transportadora';
    
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Confirmar Geração de Pedido',
        message: `Deseja realmente gerar o pedido para a transportadora ${transportadora}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.numeroPedidoGerado = '4500' + Math.floor(100000 + Math.random() * 900000).toString();
        this.pedidoGerado = true;
        
        this.registrarLog('Geração de Pedido', `Pedido ${this.numeroPedidoGerado} gerado para ${transportadora}`);
        
        this.snackBar.open('Pedido gerado com sucesso!', 'OK', { 
          duration: 4000,
          panelClass: ['success-snackbar']
        });
        this.cdr.detectChanges();
      }
    });
  }

  gerarColeta() {
    const transportadora = this.approvedQuotation?.transportadora || 'Transportadora';
    
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Confirmar Geração de Coleta',
        message: `Deseja realmente gerar a coleta para a transportadora ${transportadora}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.numeroColetaGerado = 'COL-' + Math.floor(100000 + Math.random() * 900000).toString();
        this.coletaGerada = true;
        
        this.registrarLog('Geração de Coleta', `Coleta ${this.numeroColetaGerado} gerada para ${transportadora}`);
        
        this.snackBar.open('Coleta gerada com sucesso!', 'OK', { 
          duration: 4000,
          panelClass: ['success-snackbar']
        });
        this.cdr.detectChanges();
      }
    });
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

  aprovarFrete() {
    if (!this.justificativaValidacao) {
      this.snackBar.open('Por favor, preencha a justificativa antes de aprovar.', 'Fechar', { duration: 4000 });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: {
        title: 'Confirmar Aprovação Final',
        message: 'Deseja realmente realizar a aprovação final e emitir este pedido de Frete Expresso?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.registrarLog('Aprovação Final', 'Solicitação de frete validada e aprovada para emissão.');
        this.snackBar.open('Frete Expresso aprovado e pedido emitido com sucesso!', 'Sucesso', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
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
        this.registrarLog('Cancelamento', 'Solicitação de frete cancelada na etapa de pedido.');
        this.snackBar.open('Solicitação de frete cancelada.', 'Fechar', { duration: 3000 });
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
}
