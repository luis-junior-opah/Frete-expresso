import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()" *ngIf="!data.isAlert">Não</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="true">{{ data.isAlert ? 'Entendido' : 'Sim' }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-actions { padding-bottom: 16px; padding-right: 16px; }
  `]
})
export class ConfirmDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string; isAlert?: boolean }
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
