import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

interface Feriado {
  id: string;
  data: string;
  descricao: string;
}

interface Transportadora {
  id: string;
  nome: string;
  cliente: string;
  homologada: boolean;
}

interface Alcada {
  id: string;
  unitCD: string;
  sequencia: number;
  limiteInferior: number;
  limiteSuperior: number;
  aprovador: string;
  ausenciaInicio: string;
  ausenciaFim: string;
  emAusencia: boolean;
}

@Component({
  selector: 'app-configuracoes-view',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule, 
    MatButtonModule, 
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatDividerModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  templateUrl: './configuracoes-view.html',
  styleUrls: ['./configuracoes-view.css']
})
export class ConfiguracoesView {
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  activeTab = 0;

  // Parametrizações
  raioMaxAglutinacao = '10';
  slaExpiracaoCotacao = '40';
  slaProrrogacao = '30';
  slaEscalonamento = '30';
  margemTolerancia = '10';
  periodoHistorico = '180';
  limiteArquivo = '25';
  horarioInicio = '07:00';
  horarioFim = '20:00';

  // Feriados
  feriados = signal<Feriado[]>([
    { id: '1', data: '2026-01-01', descricao: 'Ano Novo' },
    { id: '2', data: '2026-04-21', descricao: 'Tiradentes' },
    { id: '3', data: '2026-05-01', descricao: 'Dia do Trabalho' },
  ]);

  // Transportadoras
  transportadoras = signal<Transportadora[]>([
    { id: '1', nome: 'ARIANA COMETAS', cliente: 'JOHN DEERE', homologada: true },
    { id: '2', nome: 'RAPIDÃO COMETA', cliente: 'JOHN DEERE', homologada: true },
    { id: '3', nome: 'BRASPRESS', cliente: 'JOHN DEERE', homologada: false },
  ]);

  // Alçadas
  alcadas = signal<Alcada[]>([
    { id: '1', unitCD: 'CD001', sequencia: 1, limiteInferior: 0, limiteSuperior: 5000, aprovador: 'João Silva', ausenciaInicio: '', ausenciaFim: '', emAusencia: false },
    { id: '2', unitCD: 'CD001', sequencia: 2, limiteInferior: 5000.01, limiteSuperior: 15000, aprovador: 'Maria Santos', ausenciaInicio: '', ausenciaFim: '', emAusencia: false },
  ]);

  voltar() {
    this.router.navigate(['/home']);
  }

  salvarParametros() {
    this.snackBar.open('Parametrizações salvas com sucesso!', 'Fechar', { duration: 3000 });
  }

  toggleHomologacao(id: string) {
    this.transportadoras.update(list => 
      list.map(t => t.id === id ? { ...t, homologada: !t.homologada } : t)
    );
  }

  deleteFeriado(id: string) {
    this.feriados.update(list => list.filter(f => f.id !== id));
  }

  deleteAlcada(id: string) {
    this.alcadas.update(list => list.filter(a => a.id !== id));
  }
}

