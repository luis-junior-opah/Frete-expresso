import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResumoStepView } from './resumo-step-view';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('ResumoStepView', () => {
  let component: ResumoStepView;
  let fixture: ComponentFixture<ResumoStepView>;
  let mockSnackBar = {
    open: () => {}
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumoStepView],
      providers: [
        provideAnimations(),
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResumoStepView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should save justification and open snackbar', () => {
    const snackBar = fixture.debugElement.injector.get(MatSnackBar);
    const snackBarSpy = vi.spyOn(snackBar, 'open');
    component.justificativaValidacao = 'Nova Justificativa';
    component.frete = { id: '21978' } as any;
    component.salvarJustificativa();
    expect(component.frete?.justificativa).toBe('Nova Justificativa');
    expect(snackBarSpy).toHaveBeenCalledWith('Justificativa de validação salva com sucesso!', 'OK', expect.any(Object));
  });
});
