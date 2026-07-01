# 🚚 Frete Expresso - Sistema de Gestão Logística

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Material](https://img.shields.io/badge/Material_Design-757575?style=for-the-badge&logo=material-design&logoColor=white)

O **Frete Expresso** é um protótipo avançado em Angular desenvolvido para modernizar e otimizar o fluxo de solicitação, cotação e aprovação de fretes logísticos (Individuais ou Aglutinados).

## 📑 Índice
1. [Sobre o Projeto](#-sobre-o-projeto)
2. [Principais Funcionalidades](#-principais-funcionalidades)
3. [Regras de Negócio e Fluxos](#-regras-de-negócio-e-fluxos)
4. [Arquitetura do Projeto](#-arquitetura-do-projeto)
5. [Padrões de Desenvolvimento](#-padrões-de-desenvolvimento)
6. [Como Executar Localmente](#-como-executar-localmente)

---

## 🎯 Sobre o Projeto
Este sistema foi criado para substituir fluxos manuais de negociação de fretes por uma esteira digital. Ele permite que os times logísticos analisem demandas, agrupem cargas compatíveis (Aglutinação), solicitem cotações de transportadores parceiros, submetam à aprovação financeira (Alçadas) e acompanhem o histórico completo até a validação final.

## ✨ Principais Funcionalidades
* **Painel de Acompanhamento (Dashboard):** Visão geral de todas as solicitações, com indicadores de status (Em andamento, Aprovado, Pendente, Cancelado).
* **Wizard de Solicitação (Steps):** Fluxo em etapas para aprovação interna:
  1. Cotações (Lista de transportadoras e seleção de propostas).
  2. Aprovação (Matriz de Alçadas com SLA em tempo real).
  3. Validação (Ajuste de Janelas Operacionais e Análise de Viabilidade).
  4. Pedido (Transmissão e Faturamento).
  5. Resumo.
* **Portal do Transportador (Inserção de Cotação):** Tela dedicada onde o transportador preenche Valores e Transit Times (TT) Coleta/Entrega.
* **Histórico e Auditoria:** Timeline interativa detalhando quem fez o quê e quando.

---

## 🧠 Regras de Negócio e Fluxos

### Demandas Individuais vs. Aglutinadas
A plataforma trata cargas de duas formas:
* **Individual:** Um único frete sendo cotado e transportado.
* **Aglutinada:** Múltiplas demandas (fretes) agrupadas no mesmo veículo para otimização de rota e custo (Consolidação). 
  * *Impacto na UI:* Quando aglutinado, o sistema exibe cards de "Demanda 1" e "Demanda 2", além de um card "Visão Consolidada" que soma Volumetria, Peso Real e Peso Cubado.

### Modalidade de Cotação (Transportador)
Na tela de cotação (`edicao-frete-view`), o transportador informa:
* **Valores Principais:** TT Coleta, TT Entrega e Valor Individual.
* **Valores Complementares:** Ativado apenas para fretes aglutinados, gera cálculos automáticos do Valor Total e TTs para rotas compostas.
* **Cobrança Adicional:** Modal para justificar taxas extras (Diária, Ajudante, Pernoite).

---

## 📂 Arquitetura do Projeto

O projeto segue a arquitetura de features (Feature-based structure) comum em Angular moderno:

```text
src/app/
├── core/                   # Serviços singletons, interceptors e guardas
│   ├── models/             # Tipagens de domínio (ex: frete.model.ts)
│   └── services/           # Regras de comunicação (ex: frete.service.ts, dados mockados)
├── features/               # Módulos de negócio da aplicação (Telas)
│   ├── acompanhamento-panel/ # Tela 00 - Dashboard principal
│   ├── solicitacao-step/     # O fluxo de 5 passos da esteira
│   ├── edicao-frete-view/    # Tela de preenchimento da cotação pelo Transportador
│   ├── historico-view/       # Tela de log e auditoria
│   └── configuracoes-view/   # Ajustes de sistema
└── shared/                 # Componentes reutilizáveis em múltiplas features
    └── components/         # Modais padrão (ex: confirm-dialog)
```

---

## 🎨 Padrões de Desenvolvimento (UI/UX)

Para garantir consistência visual e facilitar a manutenção, adotamos diretrizes rígidas de CSS:

1. **Angular Material (Customizado):** Utilizamos as bases do Material (MatCards, MatDialogs, MatButtons), mas aplicamos classes utilitárias para dar um aspecto mais "Premium".
   * *Exemplo:* A classe `.premium-shadow` arredonda as bordas para `24px` e aplica uma sombra suave moderna.
2. **Grid System (12 Colunas):** Em formulários e cards de exibição (como na tela de cotação e histórico), não usamos larguras fixas. Usamos `.info-grid` atrelado a classes utilitárias (`.col-span-4`, `.col-span-6`, `.col-span-12`), facilitando a responsividade.
3. **Tipografia:** 
   * Títulos de cards e informações importantes utilizam fontes extra-bold (`font-weight: 900`).
   * Valores preenchidos utilizam fontes normais (`font-weight: 400`) para excelente contraste e escaneabilidade (`.info-item label` vs `.info-item .value`).
4. **Cores e Semântica:**
   * Ações Destrutivas (Declinar, Cancelar): Vermelho (`#ef4444` / `color="warn"`).
   * Ações Sucesso (Aprovar, Enviar): Verde (`#22c55e` / `.success-btn`).
   * Ações Correção/Alerta: Âmbar/Laranja (`#f59e0b` / `.correcao-btn`).
   * Ações Especiais (Cobrança Adicional): Índigo/Roxo (`#6366f1`).

---

## 🚀 Como Executar Localmente

### Pré-requisitos
* Node.js v18.x ou superior.
* Angular CLI (`npm install -g @angular/cli`).

### Passos
1. Clone o repositório:
   ```bash
   git clone https://github.com/luis-junior-opah/Frete-expresso.git
   ```
2. Acesse a pasta do projeto:
   ```bash
   cd frete-expresso-angular
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Execute o servidor de desenvolvimento:
   ```bash
   ng serve
   ```
5. Acesse `http://localhost:4200` no seu navegador.

*(Nota: Como o projeto é atualmente um protótipo de Frontend, os dados estão armazenados localmente em mocks no `frete.service.ts`)*

---
*Documentação atualizada em Junho de 2026.*