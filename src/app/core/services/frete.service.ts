import { Injectable, signal } from '@angular/core';
import { Frete, CotacaoFrete } from '../models/frete.model';

@Injectable({
  providedIn: 'root'
})
export class FreteService {
  private readonly initialFretes: Frete[] = [
    {
      id: '21978',
      cliente: 'JOHN DEERE (CATALAO)',
      fornecedor: 'MIRASSOL SP',
      transportador: 'JM PREMIER',
      dataInicioJanela: '04/12/2023 - 12:30',
      dataFimJanela: '09/12/2023 - 07:00',
      fluxo: 'Fornecedor',
      dataNecessidadeEntrega: '09/12/2023 - 10:00',
      codigoNox: 'NX12345',
      numeroPedido: 'PD98765',
      codigoColeta: 'CL54321',
      solicitante: 'João Silva',
      status: 'Em andamento',
      etapa: 'Cotações',
      enderecoColeta: 'Av. Dejair José Marques, 3055 - Regissol, Mirassol - SP, 15133-284',
      enderecoEntrega: 'Av. João Neves de Oliveira, 450 - Distrito Industrial, Catalão - GO, 75709-665',
      unitCD: '3000',
      distancia: 750,
      dataCriacao: '02/06/2026 10:30',
      modal: 'Rodoviário',
      tipoVeiculo: 'Truck Aberto - Capacidade máx: 12000.0 Kgs - 50.63 m³',
      tipoMaterial: 'Direto',
      justificativa: 'Urgência dos distribuidores',
      volumetria: 20,
      altura: 2,
      comprimento: 5,
      largura: 2,
      peso: 8500,
      permitirAgrupamento: true,
      observacoes: 'Material extremamente frágil. Cuidado no manuseio.'
    },
    {
      id: '21987',
      cliente: 'JOHN DEERE (MONTENEGRO)',
      fornecedor: 'PORTO ALEGRE RS',
      transportador: 'RAPIDÃO COMETA',
      dataInicioJanela: '05/12/2023 - 08:00',
      dataFimJanela: '10/12/2023 - 18:00',
      fluxo: 'Fábrica',
      dataNecessidadeEntrega: '10/12/2023',
      codigoNox: 'NX22345',
      numeroPedido: 'PD88765',
      codigoColeta: 'CL44321',
      solicitante: 'Maria Santos',
      status: 'Em aprovação',
      etapa: 'Aprovações',
      enderecoColeta: 'PORTO ALEGRE',
      enderecoEntrega: 'MONTENEGRO',
      unitCD: '3Q00',
      distancia: 1500,
      dataCriacao: '2026-06-02 08:15:00',
      cotacao: {
        cotacaoIndividual: 8500,
        transitTimeColeta: 24,
        transitTimeEntrega: 48,
        transportadoraId: 'RAPIDÃO COMETA',
        dataSubmissao: '05/12/2023 10:30',
        usuarioSubmissao: 'transportadora@rapidao.com'
      }
    },
    {
      id: '21990',
      cliente: 'JOHN DEERE (HORIZONTINA)',
      fornecedor: 'SAO PAULO SP',
      transportador: 'BRASPRESS',
      dataInicioJanela: '06/12/2023 - 06:00',
      dataFimJanela: '11/12/2023 - 20:00',
      fluxo: 'Fábrica',
      dataNecessidadeEntrega: '11/12/2023',
      codigoNox: 'NX32345',
      numeroPedido: 'PD78765',
      codigoColeta: 'CL34321',
      solicitante: 'Pedro Oliveira',
      status: 'Aprovado',
      etapa: 'Validação',
      enderecoColeta: 'SAO PAULO',
      enderecoEntrega: 'HORIZONTINA',
      unitCD: 'BM00',
      distancia: 2100,
      dataCriacao: '2026-06-01 14:20:00'
    },
    {
      id: '21995',
      cliente: 'JOHN DEERE (CATALAO)',
      fornecedor: 'CURITIBA PR',
      transportador: 'JAMEF',
      dataInicioJanela: '07/12/2023 - 07:00',
      dataFimJanela: '12/12/2023 - 19:00',
      fluxo: 'Fornecedor',
      dataNecessidadeEntrega: '12/12/2023',
      codigoNox: 'NX42345',
      numeroPedido: 'PD68765',
      codigoColeta: 'CL24321',
      solicitante: 'Ana Costa',
      status: 'Cancelado',
      etapa: 'Validação',
      enderecoColeta: 'CURITIBA',
      enderecoEntrega: 'Av. João Neves de Oliveira, 450 - Distrito Industrial, Catalão - GO, 75709-665',
      unitCD: '3000',
      distancia: 950,
      dataCriacao: '2026-06-01 16:45:00'
    },
    {
      id: '22001',
      cliente: 'JOHN DEERE (MONTENEGRO)',
      fornecedor: 'BELO HORIZONTE MG',
      transportador: 'PATRUS',
      dataInicioJanela: '08/12/2023 - 09:00',
      dataFimJanela: '13/12/2023 - 17:00',
      fluxo: 'Fábrica',
      dataNecessidadeEntrega: '13/12/2023',
      codigoNox: 'NX52345',
      numeroPedido: 'PD58765',
      codigoColeta: 'CL14321',
      solicitante: 'Carlos Ferreira',
      status: 'Aprovado',
      etapa: 'Pedido',
      enderecoColeta: 'BELO HORIZONTE',
      enderecoEntrega: 'MONTENEGRO',
      unitCD: '3Q00',
      distancia: 1800,
      dataCriacao: '2026-05-31 09:30:00'
    },
    {
      id: '22005',
      cliente: 'JOHN DEERE (HORIZONTINA)',
      fornecedor: 'MIRASSOL SP',
      transportador: 'JSL',
      dataInicioJanela: '09/12/2023 - 10:00',
      dataFimJanela: '14/12/2023 - 16:00',
      fluxo: 'Fornecedor',
      dataNecessidadeEntrega: '14/12/2023',
      codigoNox: 'NX62345',
      numeroPedido: 'PD48765',
      codigoColeta: 'CL04321',
      solicitante: 'Fernanda Lima',
      status: 'Cancelado',
      etapa: 'Cotações',
      enderecoColeta: 'Av. Dejair José Marques, 3055 - Regissol, Mirassol - SP, 15133-284',
      enderecoEntrega: 'HORIZONTINA',
      unitCD: 'BM00',
      distancia: 1650,
      dataCriacao: '2026-05-30 11:15:00'
    },
    {
      id: '22010',
      cliente: 'JOHN DEERE (CATALAO)',
      fornecedor: 'PORTO ALEGRE RS',
      transportador: 'TCA',
      dataInicioJanela: '10/12/2023 - 08:00',
      dataFimJanela: '15/12/2023 - 18:00',
      fluxo: 'Fábrica',
      dataNecessidadeEntrega: '15/12/2023',
      codigoNox: 'NX72345',
      numeroPedido: 'PD38765',
      codigoColeta: 'CL93321',
      solicitante: 'Roberto Alves',
      status: 'Expirado',
      etapa: 'Aprovações',
      enderecoColeta: 'PORTO ALEGRE',
      enderecoEntrega: 'Av. João Neves de Oliveira, 450 - Distrito Industrial, Catalão - GO, 75709-665',
      unitCD: '3000',
      distancia: 1700,
      dataCriacao: '2026-05-29 13:00:00'
    },
    {
      id: '22015',
      cliente: 'JOHN DEERE (MONTENEGRO)',
      fornecedor: 'SAO PAULO SP',
      transportador: 'RODONAVES',
      dataInicioJanela: '11/12/2023 - 07:00',
      dataFimJanela: '16/12/2023 - 19:00',
      fluxo: 'Fornecedor',
      dataNecessidadeEntrega: '16/12/2023',
      codigoNox: 'NX82345',
      numeroPedido: 'PD28765',
      codigoColeta: 'CL83321',
      solicitante: 'Juliana Souza',
      status: 'Contigência Adm',
      etapa: 'Resumo',
      enderecoColeta: 'SAO PAULO',
      enderecoEntrega: 'MONTENEGRO',
      unitCD: '3Q00',
      distancia: 1200,
      dataCriacao: '2026-06-02 07:00:00'
    },
    {
      id: '22020',
      cliente: 'JOHN DEERE (HORIZONTINA)',
      fornecedor: 'CURITIBA PR',
      transportador: 'SEQUOIA',
      dataInicioJanela: '12/12/2023 - 06:00',
      dataFimJanela: '17/12/2023 - 20:00',
      fluxo: 'Fábrica',
      dataNecessidadeEntrega: '17/12/2023',
      codigoNox: 'NX92345',
      numeroPedido: 'PD18765',
      codigoColeta: 'CL73321',
      solicitante: 'Marcos Ribeiro',
      status: 'Cancelado',
      etapa: 'Pedido',
      enderecoColeta: 'CURITIBA',
      enderecoEntrega: 'HORIZONTINA',
      unitCD: 'BM00',
      distancia: 850,
      dataCriacao: '2026-05-28 15:30:00'
    },
    {
      id: '22025',
      cliente: 'JOHN DEERE (CATALAO)',
      fornecedor: 'BELO HORIZONTE MG',
      transportador: 'SANTOS BRASIL',
      dataInicioJanela: '13/12/2023 - 09:00',
      dataFimJanela: '18/12/2023 - 17:00',
      fluxo: 'Fornecedor',
      dataNecessidadeEntrega: '18/12/2023',
      codigoNox: 'NX02345',
      numeroPedido: 'PD08765',
      codigoColeta: 'CL63321',
      solicitante: 'Patricia Martins',
      status: 'Aprovado',
      etapa: 'Validação',
      enderecoColeta: 'BELO HORIZONTE',
      enderecoEntrega: 'Av. João Neves de Oliveira, 450 - Distrito Industrial, Catalão - GO, 75709-665',
      unitCD: '3000',
      distancia: 680,
      dataCriacao: '27/05/2026 10:00'
    }
  ];

  public fretes = signal<Frete[]>(this.initialFretes);

  constructor() {}

  getFreteById(id: string): Frete | undefined {
    return this.fretes().find(f => f.id === id);
  }

  addFrete(frete: Frete): void {
    this.fretes.update(current => [...current, frete]);
  }

  updateFrete(id: string, updates: Partial<Frete>): void {
    this.fretes.update(current => 
      current.map(f => f.id === id ? { ...f, ...updates } : f)
    );
  }

  aglutinarFretes(freteIds: string[]): void {
    const aglutinadorId = 'AG-' + Date.now();
    this.fretes.update(current => 
      current.map(f => freteIds.includes(f.id) ? { ...f, aglutinadorId } : f)
    );
  }

  submeterCotacao(freteId: string, cotacao: CotacaoFrete): void {
    this.fretes.update(current => 
      current.map(f => f.id === freteId ? { ...f, cotacao, status: 'Em aprovação', etapa: 'Aprovações' } : f)
    );
  }
}
