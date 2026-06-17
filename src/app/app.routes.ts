import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./features/acompanhamento-panel/acompanhamento-panel').then(m => m.AcompanhamentoPanel) },
  { path: 'solicitacao', loadComponent: () => import('./features/solicitacao-step/solicitacao-step').then(m => m.SolicitacaoStep) },
  { path: 'solicitacao/:id', loadComponent: () => import('./features/solicitacao-step/solicitacao-step').then(m => m.SolicitacaoStep) },
  { path: 'cotacoes', loadComponent: () => import('./features/cotacoes-panel/cotacoes-panel').then(m => m.CotacoesPanel) },
  { path: 'aprovacao', loadComponent: () => import('./features/aprovacao-step/aprovacao-step').then(m => m.AprovacaoStep) },
  { path: 'edicao/:id', loadComponent: () => import('./features/edicao-frete-view/edicao-frete-view').then(m => m.EdicaoFreteView) },
  { path: 'historico/:id', loadComponent: () => import('./features/historico-view/historico-view').then(m => m.HistoricoView) },
  { path: 'configuracoes', loadComponent: () => import('./features/configuracoes-view/configuracoes-view').then(m => m.ConfiguracoesView) },
  { path: '**', redirectTo: 'home' }
];

