import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Frete } from '../../../../core/models/frete.model';

@Component({
  selector: 'app-solicitacao-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './solicitacao-card.html',
  styleUrl: './solicitacao-card.css',
})
export class SolicitacaoCard {
  @Input() frete?: Frete;

  get pesoCubado(): number {
    if (!this.frete) return 0;
    
    const altura = this.frete.altura || 0;
    const largura = this.frete.largura || 0;
    const comprimento = this.frete.comprimento || 0;
    
    // Fator de cubagem rodoviário padrão: 300
    // (Altura x Largura x Comprimento) x 300
    return (altura * largura * comprimento) * 300;
  }
}
