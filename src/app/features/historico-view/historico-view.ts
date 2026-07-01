import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { SolicitacaoCard } from '../solicitacao-step/components/solicitacao-card/solicitacao-card';
import { FreteService } from '../../core/services/frete.service';
import { Frete } from '../../core/models/frete.model';

@Component({
  selector: 'app-historico-view',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatExpansionModule,
    MatTableModule,
    MatTooltipModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    SolicitacaoCard
  ],
  templateUrl: './historico-view.html',
  styleUrls: ['./historico-view.css']
})
export class HistoricoView implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private freteService = inject(FreteService);
  private cdr = inject(ChangeDetectorRef);

  frete = signal<Frete | undefined>(undefined);
  
  // Mock consolidado para o dossiê final
  groupedDemands: any[] = [
    {
      id: 21978,
      pedido: '4500123999',
      aglutinador: 'AGL-BASE',
      inicioJanela: '16/06/2026 08:00',
      fimJanela: '16/06/2026 18:00',
      localColeta: 'FORNECEDOR ALFA S.A. - RUA DAS INDÚSTRIAS, 1500, DISTRITO INDUSTRIAL, SÃO PAULO - SP, CEP 04578-000',
      distancia: '0 km',
      localEntrega: 'CD CENTRAL LOGÍSTICA - AV. PRESIDENTE DUTRA, KM 210, BONSUCESSO, GUARULHOS - SP, CEP 07170-350',
      necessidadeEntrega: '17/06/2026 10:00',
      transportador: 'A Definir',
      peso: 1500,
      volumetria: 8.5,
      fornecedor: 'FORNECEDOR ALFA S.A.',
      codUnidade: '3Q00',
      cliente: 'CLIENTE X',
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
      observacoes: '-'
    }
  ];

  aglutinadosColumns: string[] = [
    'ag_id', 'ag_pedido', 'ag_fornecedor', 'ag_localColeta', 
    'ag_distancia', 'ag_inicioJanela', 'ag_fimJanela', 
    'ag_necessidadeEntrega', 'ag_modal', 'ag_tipoVeiculo', 'ag_fluxo', 
    'ag_tipoMaterial', 'ag_altura', 'ag_comprimento', 'ag_largura', 'ag_peso', 
    'ag_volumetria', 'ag_solicitante', 'ag_dataCriacao'
  ];

  approvedQuotation = {
    transportadora: 'MIRASSOL',
    status: 'Aprovado',
    observacao: 'Cotação dentro do budget planejado para a rota. Veículo com rastreamento ativo e disponibilidade imediata para o fluxo solicitado.',
    temAnexo: true,
    individual: { ttColeta: 24, ttEntrega: 48, ttTotal: 72, valor: 8500, valorHistorico: 8000 },
    complementar: { ttColeta: 12, ttEntrega: 24, ttTotal: 36, valor: 1200, valorHistorico: 1500 }
  };

  aprovadoresAtuais = [
    { nome: 'Ricardo Santos', email: 'ricardo.santos@empresa.com', avatar: 'RS', nivel: 'L1' },
    { nome: 'Juliana Mendes', email: 'juliana.mendes@empresa.com', avatar: 'JM', nivel: 'L2' }
  ];

  usuarioAprovador = 'Juliana Mendes';
  tipoAprovacao = 'agrupado';
  aglutinadosTipoVeiculo = 'Truck Aberto';
  numeroPedidoGerado = '4500889922';
  numeroColetaGerado = 'COL-776655';
  justificativaValidacao = 'Dossiê validado. Aprovação realizada conforme alinhamento estratégico com a gerência de suprimentos para garantir o atendimento de pedido crítico sem comprometer o SLA de entrega do cliente final.';

  cobrancaExtra = {
    tipoOcorrencia: 'Diária Excedente - Diária de motorista',
    justificativa: 'Fila de espera de mais de 8 horas para descarregamento no CD do cliente.',
    valor: 450.00,
    arquivos: ['evidencia_espera.pdf'],
    status: 'Aprovado'
  };

  logsConsolidados: any[] = [
    { timestamp: '2026-06-17T11:20:00.000Z', usuario: 'juliana.mendes@empresa.com', acao: 'Aprovação de Cobrança Extra', detalhes: 'Cobrança extra no valor de R$ 450.00 aprovada.', status: 'approved' },
    { timestamp: '2026-06-17T09:15:00.000Z', usuario: 'usuario@transportadora.com', acao: 'Cobrança Extra Submetida', detalhes: 'Cobrança extra submetida (Diária Excedente - Diária de motorista: R$ 450.00).', status: 'info' },
    { timestamp: '2026-06-16T18:30:00.123Z', usuario: 'usuario.logado@empresa.com', acao: 'Geração de Coleta', detalhes: 'Coleta COL-776655 gerada para MIRASSOL', status: 'success' },
    { timestamp: '2026-06-16T18:28:15.456Z', usuario: 'usuario.logado@empresa.com', acao: 'Geração de Pedido', detalhes: 'Pedido 4500889922 gerado para MIRASSOL', status: 'success' },
    { timestamp: '2026-06-16T17:45:30.789Z', usuario: 'juliana.mendes@empresa.com', acao: 'Aprovação realizada', detalhes: 'Cotação aprovada por Juliana Mendes como agrupado.', status: 'approved' },
    { timestamp: '2026-06-16T14:15:10.012Z', usuario: 'usuario.logado@empresa.com', acao: 'Agrupamento realizado', detalhes: 'Demanda #101 agrupada com o frete principal.', status: 'info' },
    { timestamp: '2026-06-16T12:00:05.999Z', usuario: 'usuario.logado@empresa.com', acao: 'Geração de Solicitação', detalhes: 'Protocolo de frete expresso registrado.', status: 'start' }
  ];

  formatarDataLog(timestampIso: string): string {
    const date = new Date(timestampIso);
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    const formatter = new Intl.DateTimeFormat('pt-BR', options);
    const parts = formatter.formatToParts(date);
    const getValue = (type: string) => parts.find(p => p.type === type)?.value || '';
    
    const day = getValue('day');
    const month = getValue('month');
    const year = getValue('year');
    const hour = getValue('hour');
    const minute = getValue('minute');
    const second = getValue('second');
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    
    return `${day}/${month}/${year} às ${hour}:${minute}:${second}:${ms}`;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.frete.set(this.freteService.getFreteById(id));
    }
  }

  voltar() {
    this.router.navigate(['/home']);
  }

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
}
