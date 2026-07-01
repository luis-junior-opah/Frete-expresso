import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-filter-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSliderModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <div class="filter-modal">
      <h2 mat-dialog-title>Filtrar Demandas</h2>
      <mat-divider></mat-divider>
      
      <mat-dialog-content class="mt-4">
        <form [formGroup]="filterForm" class="filter-grid">
          <!-- Linha 1: Pedido e Aglutinador -->
          <mat-form-field appearance="outline" class="col-6">
            <mat-label>Pedido</mat-label>
            <input matInput formControlName="pedido" placeholder="Número do pedido">
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="col-6">
            <mat-label>Aglutinador</mat-label>
            <input matInput formControlName="aglutinador" placeholder="Número do aglutinador">
          </mat-form-field>

          <!-- Linha 2: Início Janela -->
          <div class="col-6 flex-gap-1">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Início Janela (Data)</mat-label>
              <input matInput type="date" formControlName="dataInicio">
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Hora</mat-label>
              <input matInput type="time" formControlName="horaInicio">
            </mat-form-field>
          </div>

          <!-- Linha 3: Fim Janela -->
          <div class="col-6 flex-gap-1">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Fim Janela (Data)</mat-label>
              <input matInput type="date" formControlName="dataFim">
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Hora</mat-label>
              <input matInput type="time" formControlName="horaFim">
            </mat-form-field>
          </div>

          <!-- Linha 4: Necessidade Entrega -->
          <div class="col-12 flex-gap-1">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Necessidade de Entrega (Data)</mat-label>
              <input matInput type="date" formControlName="dataNecessidade">
            </mat-form-field>
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Hora</mat-label>
              <input matInput type="time" formControlName="horaNecessidade">
            </mat-form-field>
          </div>

          <!-- Linha 5: Local de Coleta -->
          <mat-form-field appearance="outline" class="col-12">
            <mat-label>Local de Coleta</mat-label>
            <mat-select formControlName="localColeta" placeholder="Selecione o local">
              <mat-option *ngFor="let local of locais" [value]="local">{{local}}</mat-option>
            </mat-select>
          </mat-form-field>

          <!-- Linha 6: Distância (Slider) -->
          <div class="col-12 slider-container">
            <label class="slider-label">Distância: {{filterForm.get('distancia')?.value}} km</label>
            <mat-slider min="0" max="150" step="1" discrete>
              <input matSliderThumb formControlName="distancia">
            </mat-slider>
          </div>

          <!-- Linha 7: Transportadora -->
          <mat-form-field appearance="outline" class="col-12">
            <mat-label>Transportadora</mat-label>
            <mat-select formControlName="transportadora" placeholder="Selecione a transportadora">
              <mat-option *ngFor="let trans of transportadoras" [value]="trans">{{trans}}</mat-option>
            </mat-select>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="flex-gap-2">
        <button mat-button color="warn" (click)="onClear()">Limpar</button>
        <button mat-stroked-button (click)="onCancel()">Voltar</button>
        <button mat-flat-button color="primary" (click)="onConfirm()">Confirmar</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .filter-modal { padding: 16px; min-width: 500px; }
    .filter-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 12px; }
    .col-6 { grid-column: span 6; }
    .col-12 { grid-column: span 12; }
    .w-100 { width: 100%; }
    .flex-gap-1 { display: flex; gap: 8px; }
    .flex-gap-2 { display: flex; gap: 16px; }
    .mt-4 { margin-top: 16px; }
    .slider-container { display: flex; flex-direction: column; margin-bottom: 16px; margin-top: 8px; }
    .slider-label { font-size: 0.85rem; color: var(--mat-sys-on-surface-variant); margin-bottom: 4px; }
    mat-slider { width: 100%; }
  `]
})
export class FilterModal {
  filterForm: FormGroup;
  
  locais = [
    'BRUNING (PANAMBI)',
    'FOTOGRAVURA ZEYANA (CAXIAS)',
    'LTM (BOTUCATU)',
    'BELLOTA (INDAIAL)',
    'HENNINGS (SOROCABA)'
  ];

  transportadoras = [
    'MIRASSOL',
    'M3 LOGÍSTICA',
    'GOLDEN CARGO',
    'VF (IVOTI)',
    'ARMANI (CAMPINAS)'
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<FilterModal>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.filterForm = this.fb.group({
      pedido: [data?.pedido || ''],
      aglutinador: [data?.aglutinador || ''],
      dataInicio: [data?.dataInicio || ''],
      horaInicio: [data?.horaInicio || ''],
      dataFim: [data?.dataFim || ''],
      horaFim: [data?.horaFim || ''],
      dataNecessidade: [data?.dataNecessidade || ''],
      horaNecessidade: [data?.horaNecessidade || ''],
      localColeta: [data?.localColeta || ''],
      distancia: [data?.distancia !== undefined ? data.distancia : 150],
      transportadora: [data?.transportadora || '']
    });
  }

  onClear(): void {
    this.filterForm.reset({
      distancia: 150
    });
    this.dialogRef.close({});
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(this.filterForm.value);
  }
}
