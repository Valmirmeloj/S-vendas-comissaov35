
export interface Opportunity {
  id: string;
  title: string;
  type: string;
  value: number;
  daysAgo: number;
  stage: string;
  user: {
    name: string;
    avatar: string;
  };
  tags: string[];
}

export interface LevelConfig {
  threshold: number; // Porcentagem (ex: 100)
  rate: number;      // Taxa de bônus (ex: 0.6)
}

export interface Targets {
  product: number;
  assistance: number;
  waterproofing: number;
  levels: {
    1: LevelConfig;
    2: LevelConfig;
    3: LevelConfig;
  };
}

export interface Sale {
  numeroPedido: string;
  valorProduto: number;
  valorAssistencia: number;
  valorImpermeabilizacao: number;
  total: number;
  data: string;
  timestamp: number;
  bonusTotal: number;
  comissaoProduto: number; // Base 2.2%
  servicosExtras: string[];
}

export interface PipelineStage {
  id: string;
  label: string;
  color: string;
}

export enum NavItem {
  Resumos = 'Resumos',
  Clientes = 'Clientes',
  Processos = 'Processos',
  Documentos = 'Documentos',
  Produtos = 'Produtos',
  RelatoriosBeta = 'Relatórios Beta',
  Relatorios = 'Relatórios',
  Biblioteca = 'Biblioteca',
  Meta = 'Meta',
  ResumoServico = 'Resumo serviço',
  ResumoPedido = 'Resumo pedido',
  AdicionarVenda = 'Adicionar vendas'
}
