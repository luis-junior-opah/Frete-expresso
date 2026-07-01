import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { HistoricoView } from './historico-view';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('HistoricoView', () => {
  let component: HistoricoView;
  let fixture: ComponentFixture<HistoricoView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoView],
      providers: [
        provideRouter([]),
        provideAnimations(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '21978'
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HistoricoView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should define cobrancaExtra and historical logs', () => {
    expect(component.cobrancaExtra).toBeDefined();
    expect(component.cobrancaExtra.status).toBe('Aprovado');
    expect(component.logsConsolidados.some(log => log.acao === 'Aprovação de Cobrança Extra')).toBe(true);
    expect(component.logsConsolidados.some(log => log.acao === 'Cobrança Extra Submetida')).toBe(true);
  });
});
