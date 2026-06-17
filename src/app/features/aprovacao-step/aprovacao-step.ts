import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FreteService } from '../../core/services/frete.service';
import { Frete } from '../../core/models/frete.model';

@Component({
  selector: 'app-aprovacao-step',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './aprovacao-step.html',
  styleUrls: ['./aprovacao-step.css']
})
export class AprovacaoStep {
  private router = inject(Router);
  private freteService = inject(FreteService);
  private snackBar = inject(MatSnackBar);

  fretes = this.freteService.fretes;

  fretesEmAnalise = computed(() => 
    this.fretes().filter(f => f.status === 'Em aprovação')
  );

  selectedFreteId = signal<string>('');
  
  freteSelecionado = computed(() => 
    this.fretes().find(f => f.id === this.selectedFreteId())
  );

  justificativa = '';

  selectFrete(id: string) {
    this.selectedFreteId.set(id);
    this.justificativa = '';
  }

  calculateVariance() {
    const frete = this.freteSelecionado();
    if (!frete?.cotacao?.cotacaoIndividual) return 0;
    
    const referenceValue = frete.cotacao.cotacaoIndividual * 0.95;
    const variance = ((frete.cotacao.cotacaoIndividual - referenceValue) / referenceValue) * 100;
    return Math.abs(variance);
  }

  hasVarianceAlert() {
    return this.calculateVariance() > 10;
  }

  voltar() {
    this.router.navigate(['/home']);
  }

  aprovar() {
    const id = this.selectedFreteId();
    if (!id) return;
    
    this.freteService.updateFrete(id, { status: 'Aprovado', etapa: 'Validação' });
    this.snackBar.open('Cotação aprovada com sucesso!', 'Fechar', { duration: 3000 });
    this.selectedFreteId.set('');
  }

  reprovar() {
    const id = this.selectedFreteId();
    if (!id) return;

    this.freteService.updateFrete(id, { status: 'Cancelado', etapa: 'Cotações' });
    this.snackBar.open('Cotação reprovada com sucesso!', 'Fechar', { duration: 3000 });
    this.selectedFreteId.set('');
  }
}

