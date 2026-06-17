import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SolicitacaoCard } from '../solicitacao-card/solicitacao-card';
import { Frete } from '../../../../core/models/frete.model';

@Component({
  selector: 'app-resumo-observacao-modal',
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
export class ResumoObservacaoModal {
  data = inject(MAT_DIALOG_DATA);
}

@Component({
  selector: 'app-resumo-step-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,
    MatTooltipModule,
    MatDialogModule,
    SolicitacaoCard
  ],
  templateUrl: './resumo-step-view.html',
  styleUrl: './resumo-step-view.css',
})
export class ResumoStepView {
  @Input() frete?: Frete;
  @Input() approvedQuotation: any = null;
  @Input() groupedDemands: any[] = [];
  @Input() aglutinadosTipoVeiculo = '';

  private dialog = inject(MatDialog);

  ondeColeta = 'ARIANA-CAMPINAS';
  
  // No Resumo, simulamos que tudo já foi gerado
  numeroPedidoGerado = '4500889922';
  numeroColetaGerado = 'COL-776655';
  justificativaValidacao = 'Aprovação finalizada com sucesso. Todos os requisitos de custo e prazo foram validados pela gerência.';

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
    this.dialog.open(ResumoObservacaoModal, {
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
}
