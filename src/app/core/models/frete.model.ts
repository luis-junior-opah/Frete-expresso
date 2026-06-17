export type FreteStatus = 'Aprovado' | 'Aprovado edição' | 'Cancelado' | 'Em andamento' | 'Em aprovação' | 'Finalizado' | 'Expirado' | 'Contigência Adm';
export type FreteEtapa = 'Cotações' | 'Aprovações' | 'Código Nox' | 'Validação' | 'Pedido' | 'Resumo' | 'Finalizada';
export type FluxoTipo = 'Fábrica' | 'Fornecedor';

export interface CotacaoFrete {
  cotacaoIndividual?: number;
  cotacaoComplementar?: number;
  transitTimeColeta?: number;
  transitTimeEntrega?: number;
  transportadoraId?: string;
  dataSubmissao?: string;
  usuarioSubmissao?: string;
}

export interface Frete {
  id: string;
  cliente: string;
  fornecedor: string;
  transportador: string;
  dataInicioJanela: string;
  dataFimJanela: string;
  fluxo: FluxoTipo;
  dataNecessidadeEntrega: string;
  codigoNox?: string;
  numeroPedido?: string;
  codigoColeta?: string;
  solicitante: string;
  status: FreteStatus;
  etapa: FreteEtapa;
  enderecoColeta: string;
  enderecoEntrega: string;
  aglutinadorId?: string;
  distancia?: number;
  unitCD: string;
  dataCriacao: string;
  cotacao?: CotacaoFrete;
  
  // Propriedades Adicionais (Formulário)
  modal?: string;
  tipoVeiculo?: string;
  tipoMaterial?: string;
  justificativa?: string;
  volumetria?: number;
  altura?: number;
  comprimento?: number;
  largura?: number;
  peso?: number;
  permitirAgrupamento?: boolean;
  observacoes?: string;
}

