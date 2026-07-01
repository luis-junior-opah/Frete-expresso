import { Injectable, signal } from '@angular/core';
import { Frete, CotacaoFrete } from '../models/frete.model';

@Injectable({
  providedIn: 'root'
})
export class FreteService {
  private readonly initialFretes: Frete[] = [
    {
      id: '21978',
      cliente: 'JOHN DEERE CATALAO (NW00)',
      fornecedor: 'BRUNING (PANAMBI)',
      transportador: 'MIRASSOL',
      dataInicioJanela: '2023-12-04 - 12:30',
      dataFimJanela: '2023-12-04 - 14:30',
      dataNecessidadeEntrega: '2023-12-04 - 16:00',
      fluxo: 'Fornecedor',
      codigoNox: 'NX12345',
      numeroPedido: 'PD98765',
      codigoColeta: 'CL54321',
      solicitante: 'João Silva',
      status: 'Em Andamento',
      etapa: 'Cotações',
      enderecoColeta: 'Av. Dejair José Marques, 3055 - Regissol, Mirassol - SP, CEP 15133-284',
      enderecoEntrega: 'Av. João Neves de Oliveira, 450 - Distrito Industrial, Catalão - GO, CEP 75709-665',
      unitCD: 'NW00',
      distancia: 750,
      dataCriacao: '2023-12-02T10:30:00',
      modal: 'Rodoviário',
      tipoVeiculo: 'Truck Aberto',
      tipoMaterial: 'Direto',
      justificativa: 'Urgência dos distribuidores',
      altura: 2.0,
      comprimento: 5.0,
      largura: 2.0,
      volumetria: 20.0,
      peso: 8500,
      permitirAgrupamento: true,
      observacoes: 'Material extremamente frágil. Cuidado no manuseio.'
    },
    {
      id: '21987',
      cliente: 'JOHN DEERE MONTENEGRO (BM00)',
      fornecedor: 'FOTOGRAVURA ZEYANA (CAXIAS)',
      transportador: 'M3 LOGÍSTICA',
      dataInicioJanela: '2023-12-05 - 08:00',
      dataFimJanela: '2023-12-05 - 10:00',
      dataNecessidadeEntrega: '2023-12-05 - 12:00',
      fluxo: 'Fábrica',
      codigoNox: 'NX22345',
      numeroPedido: 'PD88765',
      codigoColeta: 'CL44321',
      solicitante: 'Maria Santos',
      status: 'Em Aprovação',
      etapa: 'Aprovações',
      enderecoColeta: 'Rua Bento Gonçalves, 1200 - Centro, Caxias do Sul - RS, CEP 95020-360',
      enderecoEntrega: 'Rua Jacob Reinaldo Haupenthal, 340 - Industrial, Montenegro - RS, CEP 95780-000',
      unitCD: 'BM00',
      distancia: 1500,
      dataCriacao: '2023-12-02T08:15:00',
      modal: 'Rodoviário',
      tipoVeiculo: 'Carreta Bau',
      tipoMaterial: 'Embalagem',
      justificativa: 'Problema do fornecedor',
      altura: 2.4,
      comprimento: 7.0,
      largura: 2.5,
      volumetria: 42.0,
      peso: 18000,
      permitirAgrupamento: false,
      observacoes: 'Embalagens devem ser entregues lacradas.',
      cotacao: {
        cotacaoIndividual: 8500,
        transitTimeColeta: 24,
        transitTimeEntrega: 48,
        transportadoraId: 'M3 LOGÍSTICA',
        dataSubmissao: '2023-12-05T10:30:00',
        usuarioSubmissao: 'transportadora@m3logistica.com'
      }
    },
    {
      id: '21990',
      cliente: 'JOHN DEERE HORIZONTINA (CQ00)',
      fornecedor: 'LTM (BOTUCATU)',
      transportador: 'GOLDEN CARGO',
      dataInicioJanela: '2023-12-06 - 06:00',
      dataFimJanela: '2023-12-06 - 08:00',
      dataNecessidadeEntrega: '2023-12-06 - 10:00',
      fluxo: 'Fábrica',
      codigoNox: 'NX32345',
      numeroPedido: 'PD78765',
      codigoColeta: 'CL34321',
      solicitante: 'Pedro Oliveira',
      status: 'Aprovado',
      etapa: 'Validação',
      enderecoColeta: 'Av. Antônio Carlos, 6627 - Pampulha, Botucatu - SP, CEP 18618-000',
      enderecoEntrega: 'Rua das Indústrias, 500 - Distrito Industrial, Horizontina - RS, CEP 98920-000',
      unitCD: 'CQ00',
      distancia: 2100,
      dataCriacao: '2023-12-01T14:20:00',
      modal: 'Rodoviário',
      tipoVeiculo: 'Carreta Vanderleia',
      tipoMaterial: 'Direto',
      justificativa: 'Mudança de programa na produção',
      altura: 2.6,
      comprimento: 9.0,
      largura: 2.5,
      volumetria: 58.5,
      peso: 28000,
      permitirAgrupamento: true,
      observacoes: 'Peças metálicas. Verificar amarração antes do transporte.'
    },
    {
      id: '21995',
      cliente: 'JOHN DEERE CATALAO (NW00)',
      fornecedor: 'BELLOTA (INDAIAL)',
      transportador: 'VF (IVOTI)',
      dataInicioJanela: '2023-12-07 - 07:00',
      dataFimJanela: '2023-12-07 - 09:00',
      dataNecessidadeEntrega: '2023-12-07 - 11:00',
      fluxo: 'Fornecedor',
      codigoNox: 'NX42345',
      numeroPedido: 'PD68765',
      codigoColeta: 'CL24321',
      solicitante: 'Ana Costa',
      status: 'Cancelado',
      etapa: 'Validação',
      enderecoColeta: 'Rua Hermann Hering, 1561 - Velha, Indaial - SC, CEP 89130-000',
      enderecoEntrega: 'Av. João Neves de Oliveira, 450 - Distrito Industrial, Catalão - GO, CEP 75709-665',
      unitCD: 'NW00',
      distancia: 950,
      dataCriacao: '2023-12-01T16:45:00',
      modal: 'Rodoviário',
      tipoVeiculo: 'Toco',
      tipoMaterial: 'Reposição',
      justificativa: 'Atraso da transportadora',
      altura: 1.8,
      comprimento: 4.0,
      largura: 2.0,
      volumetria: 14.4,
      peso: 4500,
      permitirAgrupamento: false,
      observacoes: 'Frete cancelado após acordo com fornecedor.'
    },
    {
      id: '22001',
      cliente: 'JOHN DEERE MONTENEGRO (BM00)',
      fornecedor: 'HENNINGS (SOROCABA)',
      transportador: 'MIRASSOL',
      dataInicioJanela: '2023-12-08 - 09:00',
      dataFimJanela: '2023-12-08 - 11:00',
      dataNecessidadeEntrega: '2023-12-08 - 13:00',
      fluxo: 'Fábrica',
      codigoNox: 'NX52345',
      numeroPedido: 'PD58765',
      codigoColeta: 'CL14321',
      solicitante: 'Carlos Ferreira',
      status: 'Aprovado Edição',
      etapa: 'Pedido',
      enderecoColeta: 'Rua Henrique Schaumann, 270 - Pinheiros, Sorocaba - SP, CEP 18013-000',
      enderecoEntrega: 'Rua Jacob Reinaldo Haupenthal, 340 - Industrial, Montenegro - RS, CEP 95780-000',
      unitCD: 'BM00',
      distancia: 1800,
      dataCriacao: '2023-11-31T09:30:00',
      modal: 'Rodoviário',
      tipoVeiculo: 'Truck Bau',
      tipoMaterial: 'Indireto',
      justificativa: 'Ajuste de inventário',
      altura: 2.2,
      comprimento: 6.0,
      largura: 2.3,
      volumetria: 30.36,
      peso: 10000,
      permitirAgrupamento: true,
      observacoes: 'Pedido prioritário. Entregar antes do meio-dia.'
    },
    {
      id: '22005',
      cliente: 'JOHN DEERE HORIZONTINA (CQ00)',
      fornecedor: 'BRUNING (PANAMBI)',
      transportador: 'M3 LOGÍSTICA',
      dataInicioJanela: '2023-12-09 - 10:00',
      dataFimJanela: '2023-12-09 - 12:00',
      dataNecessidadeEntrega: '2023-12-09 - 14:00',
      fluxo: 'Fornecedor',
      codigoNox: 'NX62345',
      numeroPedido: 'PD48765',
      codigoColeta: 'CL04321',
      solicitante: 'Fernanda Lima',
      status: 'Finalizado',
      etapa: 'Cotações',
      enderecoColeta: 'Av. Dejair José Marques, 3055 - Regissol, Mirassol - SP, CEP 15133-284',
      enderecoEntrega: 'Rua das Indústrias, 500 - Distrito Industrial, Horizontina - RS, CEP 98920-000',
      unitCD: 'CQ00',
      distancia: 1650,
      dataCriacao: '2023-11-30T11:15:00',
      modal: 'Rodoviário',
      tipoVeiculo: '3/4',
      tipoMaterial: 'Direto',
      justificativa: 'Força maior',
      altura: 1.5,
      comprimento: 3.0,
      largura: 1.5,
      volumetria: 6.75,
      peso: 2500,
      permitirAgrupamento: false,
      observacoes: 'Cancelamento por força maior — greve de transportadores.'
    },
    {
      id: '22010',
      cliente: 'JOHN DEERE CATALAO (NW00)',
      fornecedor: 'FOTOGRAVURA ZEYANA (CAXIAS)',
      transportador: 'GOLDEN CARGO',
      dataInicioJanela: '2023-12-10 - 08:00',
      dataFimJanela: '2023-12-10 - 10:00',
      dataNecessidadeEntrega: '2023-12-10 - 12:00',
      fluxo: 'Fábrica',
      codigoNox: 'NX72345',
      numeroPedido: 'PD38765',
      codigoColeta: 'CL93321',
      solicitante: 'Roberto Alves',
      status: 'Alerta - Contingência Administrativa',
      etapa: 'Aprovações',
      enderecoColeta: 'Rua Bento Gonçalves, 1200 - Centro, Caxias do Sul - RS, CEP 95020-360',
      enderecoEntrega: 'Av. João Neves de Oliveira, 450 - Distrito Industrial, Catalão - GO, CEP 75709-665',
      unitCD: 'NW00',
      distancia: 1700,
      dataCriacao: '2023-11-29T13:00:00',
      modal: 'Aéreo',
      tipoVeiculo: 'Aéreo',
      tipoMaterial: 'Direto',
      justificativa: 'Lançamento de novos produtos (novo projeto, nova máquina)',
      altura: 0.5,
      comprimento: 1.2,
      largura: 0.8,
      volumetria: 0.48,
      peso: 300,
      permitirAgrupamento: false,
      observacoes: 'Carga aérea sensível. Embalagem especial aprovada.'
    },
    {
      id: '22015',
      cliente: 'JOHN DEERE MONTENEGRO (BM00)',
      fornecedor: 'LTM (BOTUCATU)',
      transportador: 'ARMANI (CAMPINAS)',
      dataInicioJanela: '2023-12-11 - 07:00',
      dataFimJanela: '2023-12-11 - 09:00',
      dataNecessidadeEntrega: '2023-12-11 - 11:00',
      fluxo: 'Fornecedor',
      codigoNox: 'NX82345',
      numeroPedido: 'PD28765',
      codigoColeta: 'CL83321',
      solicitante: 'Juliana Souza',
      status: 'Alerta - Contingência Administrativa',
      etapa: 'Resumo',
      enderecoColeta: 'Av. Antônio Carlos, 6627 - Pampulha, Botucatu - SP, CEP 18618-000',
      enderecoEntrega: 'Rua Jacob Reinaldo Haupenthal, 340 - Industrial, Montenegro - RS, CEP 95780-000',
      unitCD: 'BM00',
      distancia: 1200,
      dataCriacao: '2023-12-02T07:00:00',
      modal: 'Rodoviário',
      tipoVeiculo: 'Van',
      tipoMaterial: 'Embalagem',
      justificativa: 'Erro de especificação (engenharia)',
      altura: 1.2,
      comprimento: 2.5,
      largura: 1.3,
      volumetria: 3.9,
      peso: 1200,
      permitirAgrupamento: true,
      observacoes: 'Contingência administrativa. Aguardar liberação do fiscal.'
    },
    {
      id: '22020',
      cliente: 'JOHN DEERE HORIZONTINA (CQ00)',
      fornecedor: 'BELLOTA (INDAIAL)',
      transportador: 'VF (IVOTI)',
      dataInicioJanela: '2023-12-12 - 06:00',
      dataFimJanela: '2023-12-12 - 08:00',
      dataNecessidadeEntrega: '2023-12-12 - 10:00',
      fluxo: 'Fábrica',
      codigoNox: 'NX92345',
      numeroPedido: 'PD18765',
      codigoColeta: 'CL73321',
      solicitante: 'Marcos Ribeiro',
      status: 'Cancelado',
      etapa: 'Pedido',
      enderecoColeta: 'Rua Hermann Hering, 1561 - Velha, Indaial - SC, CEP 89130-000',
      enderecoEntrega: 'Rua das Indústrias, 500 - Distrito Industrial, Horizontina - RS, CEP 98920-000',
      unitCD: 'CQ00',
      distancia: 850,
      dataCriacao: '2023-11-28T15:30:00',
      modal: 'Rodoviário',
      tipoVeiculo: 'Carreta Sider',
      tipoMaterial: 'Direto',
      justificativa: 'Antecipação de produção',
      altura: 2.5,
      comprimento: 8.0,
      largura: 2.5,
      volumetria: 50.0,
      peso: 22000,
      permitirAgrupamento: true,
      observacoes: 'Cancelado após revisão do planejamento de produção.'
    },
    {
      id: '22025',
      cliente: 'JOHN DEERE CAMPINAS (3Q00)',
      fornecedor: 'HENNINGS (SOROCABA)',
      transportador: 'ARMANI (CAMPINAS)',
      dataInicioJanela: '2023-12-13 - 09:00',
      dataFimJanela: '2023-12-13 - 11:00',
      dataNecessidadeEntrega: '2023-12-13 - 13:00',
      fluxo: 'Fornecedor',
      codigoNox: 'NX02345',
      numeroPedido: 'PD08765',
      codigoColeta: 'CL63321',
      solicitante: 'Patricia Martins',
      status: 'Em Aprovação',
      etapa: 'Validação',
      enderecoColeta: 'Rua Henrique Schaumann, 270 - Pinheiros, Sorocaba - SP, CEP 18013-000',
      enderecoEntrega: 'Rod. Santos Dumont, Km 66 - Parque Industrial, Campinas - SP, CEP 13054-750',
      unitCD: '3Q00',
      distancia: 680,
      dataCriacao: '2023-11-27T10:00:00',
      modal: 'Rodoviário',
      tipoVeiculo: 'Utilitario',
      tipoMaterial: 'Indireto',
      justificativa: 'Serviço (estoque / reabastecimento)',
      altura: 1.0,
      comprimento: 1.9,
      largura: 1.5,
      volumetria: 2.85,
      peso: 450,
      permitirAgrupamento: true,
      observacoes: 'Reabastecimento urgente de estoque mínimo.'
    }
  ];

  public fretes = signal<Frete[]>(this.initialFretes);

  constructor() {
    const randomized = this.initialFretes.map(f => this.randomizeMockFrete(f));
    this.fretes.set(randomized);
  }

  public randomizeMockFrete(frete: Partial<Frete> = {}): Frete {
    const clients = [
      'JOHN DEERE CAMPINAS (3Q00)',
      'JOHN DEERE MONTENEGRO (BM00)',
      'JOHN DEERE INDAIATUBA (BZ00)',
      'JOHN DEERE HORIZONTINA (CQ00)',
      'JOHN DEERE CATALAO (NW00)'
    ];

    const fornecedores = [
      'BRUNING (PANAMBI)',
      'FOTOGRAVURA ZEYANA (CAXIAS)',
      'LTM (BOTUCATU)',
      'BELLOTA (INDAIAL)',
      'HENNINGS (SOROCABA)'
    ];

    const fluxos: ('Fábrica' | 'Fornecedor')[] = ['Fábrica', 'Fornecedor'];
    const materials = ['Direto', 'Embalagem', 'Indireto', 'Reposição'];
    
    const justifications = [
      'Ajuste de inventário',
      'Alteração de fornecedor',
      'Antecipação de produção',
      'Atraso da transportadora',
      'Atraso da transportadora, causado pelo fornecedor',
      'Atraso no desembaraço',
      'Ação de marketing',
      'Erro de especificação (engenharia)',
      'Expresso como modelo padrão',
      'Falta de embalagem',
      'Força maior',
      'Lançamento de novos produtos (novo projeto, nova máquina)',
      'Mudança de programa na produção',
      'Mudança na decisão do planejamento, produção ou distribuição',
      'Necessidades solicitadas externamente (arrendatário, fazendeiro)',
      'Problema de qualidade da fábrica',
      'Problema de qualidade do fornecedor',
      'Problema do fornecedor',
      'Serviço (estoque / reabastecimento)',
      'Urgência dos distribuidores'
    ];

    const veiculosList = [
      { value: 'Aéreo', pesoMax: 999999.0, volumetriaMax: 94.5 },
      { value: 'Truck Aberto', pesoMax: 12000.0, volumetriaMax: 50.63 },
      { value: '3/4 Aberto', pesoMax: 3000.0, volumetriaMax: 20.0 },
      { value: 'Carreta Bau', pesoMax: 25000.0, volumetriaMax: 94.5 },
      { value: 'Carreta Vanderleia', pesoMax: 34000.0, volumetriaMax: 94.5 },
      { value: 'Utilitario', pesoMax: 500.0, volumetriaMax: 2.85 },
      { value: 'Van', pesoMax: 1500.0, volumetriaMax: 9.03 },
      { value: '3/4', pesoMax: 3000.0, volumetriaMax: 20.0 },
      { value: 'Toco', pesoMax: 6000.0, volumetriaMax: 46.38 },
      { value: 'Truck Sider', pesoMax: 12000.0, volumetriaMax: 50.63 },
      { value: 'Carreta Sider', pesoMax: 25000.0, volumetriaMax: 94.5 },
      { value: 'Rodotrem Sider', pesoMax: 45000.0, volumetriaMax: 168.75 },
      { value: 'Carreta Aberta', pesoMax: 25000.0, volumetriaMax: 94.5 },
      { value: 'Rodotrem Light', pesoMax: 22000.0, volumetriaMax: 189.0 },
      { value: 'Truck Van', pesoMax: 25000.0, volumetriaMax: 94.5 },
      { value: 'Truck Bau', pesoMax: 12000.0, volumetriaMax: 50.63 },
      { value: 'Rodotrem Bau', pesoMax: 22000.0, volumetriaMax: 189.0 }
    ];

    const modal = frete.modal || 'Rodoviário';
    
    // Filter vehicles by modal
    let allowedVehicles = veiculosList;
    if (modal === 'Aéreo') {
      allowedVehicles = veiculosList.filter(v => v.value === 'Aéreo');
    } else if (modal === 'Rodoviário') {
      allowedVehicles = veiculosList.filter(v => v.value !== 'Aéreo');
    }
    const vehicle = allowedVehicles[Math.floor(Math.random() * allowedVehicles.length)];
    const tipoVeiculo = vehicle.value;

    // Weight and Volumetria within the vehicle limits
    const peso = Math.floor(50 + Math.random() * (Math.min(vehicle.pesoMax, 8000) - 50));
    const volumetria = Math.round((0.5 + Math.random() * (Math.min(vehicle.volumetriaMax, 30) - 0.5)) * 100) / 100;

    // Dimensions matching volumetria
    const altura = Math.round((0.5 + Math.random() * 1.5) * 10) / 10;
    const largura = Math.round((0.5 + Math.random() * 1.5) * 10) / 10;
    const comprimento = Math.round((volumetria / (altura * largura)) * 100) / 100;
    const finalVolumetria = Math.round((altura * largura * comprimento) * 1000) / 1000;

    const cliente = clients[Math.floor(Math.random() * clients.length)];
    const fornecedor = fornecedores[Math.floor(Math.random() * fornecedores.length)];
    const fluxo = fluxos[Math.floor(Math.random() * fluxos.length)];
    const tipoMaterial = materials[Math.floor(Math.random() * materials.length)];
    const justificativa = justifications[Math.floor(Math.random() * justifications.length)];

    // Dates relative to now
    const now = new Date();
    // Start window: now + 2h to 26h
    const dateInicio = new Date(now.getTime() + 2 * 60 * 60 * 1000 + Math.random() * 24 * 60 * 60 * 1000);
    // End window: dateInicio + 2h to 6h
    const dateFim = new Date(dateInicio.getTime() + 2 * 60 * 60 * 1000 + Math.random() * 4 * 60 * 60 * 1000);
    // Necessity: dateFim + 2h to 12h
    const dateNec = new Date(dateFim.getTime() + 2 * 60 * 60 * 1000 + Math.random() * 10 * 60 * 60 * 1000);

    const formatDateStr = (d: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} - ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const dataInicioJanela = formatDateStr(dateInicio);
    const dataFimJanela = formatDateStr(dateFim);
    const dataNecessidadeEntrega = formatDateStr(dateNec);

    // Extract unit code
    const match = cliente.match(/\(([^)]+)\)$/);
    const unitCD = match ? match[1] : '';

    return {
      id: frete.id || Math.floor(Math.random() * 10000).toString(),
      transportador: frete.transportador || 'A Definir',
      solicitante: frete.solicitante || 'usuario.logado@empresa.com',
      status: frete.status || 'Em Andamento',
      etapa: frete.etapa || 'Cotações',
      enderecoColeta: frete.enderecoColeta || `Rua do Fornecedor, ${Math.floor(Math.random() * 1000)}`,
      enderecoEntrega: frete.enderecoEntrega || `Rua do Cliente, ${Math.floor(Math.random() * 1000)}`,
      dataCriacao: frete.dataCriacao || new Date().toISOString(),
      ...frete,
      cliente,
      fornecedor,
      modal,
      tipoVeiculo,
      peso,
      volumetria: finalVolumetria,
      altura,
      largura,
      comprimento,
      fluxo,
      tipoMaterial,
      justificativa,
      dataInicioJanela,
      dataFimJanela,
      dataNecessidadeEntrega,
      unitCD,
      permitirAgrupamento: true,
      observacoes: frete.observacoes || 'Preenchimento aleatório automático para testes.'
    } as Frete;
  }


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
      current.map(f => f.id === freteId ? { ...f, cotacao, status: 'Em Aprovação', etapa: 'Aprovações' } : f)
    );
  }

  // Configurações do Sistema parametrizáveis (com persistência no LocalStorage)
  public raioMaxAglutinacao = signal<string>(localStorage.getItem('raioMaxAglutinacao') || '150');
  public slaExpiracaoCotacao = signal<string>(localStorage.getItem('slaExpiracaoCotacao') || '40');
  public slaProrrogacao = signal<string>(localStorage.getItem('slaProrrogacao') || '30');
  public slaEscalonamento = signal<string>(localStorage.getItem('slaEscalonamento') || '30');
  public margemTolerancia = signal<string>(localStorage.getItem('margemTolerancia') || '10');
  public periodoHistorico = signal<string>(localStorage.getItem('periodoHistorico') || '180');
  public limiteArquivo = signal<string>(localStorage.getItem('limiteArquivo') || '25');
  public horarioInicio = signal<string>(localStorage.getItem('horarioInicio') || '07:00');
  public horarioFim = signal<string>(localStorage.getItem('horarioFim') || '20:00');
  
  // Parâmetros do cálculo de viabilidade (anteriormente mockados)
  public tempoCarregamentoColeta = signal<number>(Number(localStorage.getItem('tempoCarregamentoColeta')) || 2);
  public tempoDeslocamentoColetas = signal<number>(Number(localStorage.getItem('tempoDeslocamentoColetas')) || 4);

  // Feriados do Calendário Operacional
  private readonly defaultFeriados = [
    { id: '1', data: '2026-01-01', descricao: 'Confraternização Universal' },
    { id: '2', data: '2026-02-16', descricao: 'Carnaval' },
    { id: '3', data: '2026-02-17', descricao: 'Carnaval' },
    { id: '4', data: '2026-04-03', descricao: 'Sexta-feira Santa' },
    { id: '5', data: '2026-04-21', descricao: 'Tiradentes' },
    { id: '6', data: '2026-05-01', descricao: 'Dia do Trabalho' },
    { id: '7', data: '2026-06-04', descricao: 'Corpus Christi' },
    { id: '8', data: '2026-09-07', descricao: 'Independência do Brasil' },
    { id: '9', data: '2026-10-12', descricao: 'Nossa Senhora Aparecida' },
    { id: '10', data: '2026-11-02', descricao: 'Finados' },
    { id: '11', data: '2026-11-15', descricao: 'Proclamação da República' },
    { id: '12', data: '2026-11-20', descricao: 'Dia da Consciência Negra' },
    { id: '13', data: '2026-12-25', descricao: 'Natal' }
  ];

  public feriados = signal<any[]>(
    JSON.parse(localStorage.getItem('feriados') || 'null') || this.defaultFeriados
  );

  public salvarParametros(config: any) {
    this.raioMaxAglutinacao.set(String(config.raioMaxAglutinacao));
    this.slaExpiracaoCotacao.set(String(config.slaExpiracaoCotacao));
    this.slaProrrogacao.set(String(config.slaProrrogacao));
    this.slaEscalonamento.set(String(config.slaEscalonamento));
    this.margemTolerancia.set(String(config.margemTolerancia));
    this.periodoHistorico.set(String(config.periodoHistorico));
    this.limiteArquivo.set(String(config.limiteArquivo));
    this.horarioInicio.set(config.horarioInicio);
    this.horarioFim.set(config.horarioFim);
    this.tempoCarregamentoColeta.set(config.tempoCarregamentoColeta);
    this.tempoDeslocamentoColetas.set(config.tempoDeslocamentoColetas);

    localStorage.setItem('raioMaxAglutinacao', String(config.raioMaxAglutinacao));
    localStorage.setItem('slaExpiracaoCotacao', String(config.slaExpiracaoCotacao));
    localStorage.setItem('slaProrrogacao', String(config.slaProrrogacao));
    localStorage.setItem('slaEscalonamento', String(config.slaEscalonamento));
    localStorage.setItem('margemTolerancia', String(config.margemTolerancia));
    localStorage.setItem('periodoHistorico', String(config.periodoHistorico));
    localStorage.setItem('limiteArquivo', String(config.limiteArquivo));
    localStorage.setItem('horarioInicio', config.horarioInicio);
    localStorage.setItem('horarioFim', config.horarioFim);
    localStorage.setItem('tempoCarregamentoColeta', String(config.tempoCarregamentoColeta));
    localStorage.setItem('tempoDeslocamentoColetas', String(config.tempoDeslocamentoColetas));
  }

  public salvarFeriados(feriadosList: any[]) {
    this.feriados.set(feriadosList);
    localStorage.setItem('feriados', JSON.stringify(feriadosList));
  }
}
