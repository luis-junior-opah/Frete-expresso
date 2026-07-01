import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { EdicaoFreteView } from './edicao-frete-view';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('EdicaoFreteView', () => {
  let component: EdicaoFreteView;
  let fixture: ComponentFixture<EdicaoFreteView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdicaoFreteView],
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

    fixture = TestBed.createComponent(EdicaoFreteView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle cobranca file selection and reset', () => {
    const file = new File(['test content'], 'evidence.png', { type: 'image/png' });
    const event = { target: { files: [file] } };
    
    component.onCobrancaFileSelected(event);
    expect(component.cobrancaArquivoAnexado).toBe('evidence.png');

    component.handleCobrarAdicional();
    expect(component.cobrancaArquivoAnexado).toBeNull();
    expect(component.cobrancaExtraForm.get('motivo')?.value).toBe('');
  });

  it('should handle proposal file selection and logging', () => {
    const file = new File(['test proposal'], 'proposal.pdf', { type: 'application/pdf' });
    const event = { target: { files: [file] } };

    component.onPropostaFileSelected(event);
    expect(component.propostaArquivoAnexado).toBe('proposal.pdf');
    expect(component.historicoAlteracoes.some(h => h.acao.includes('proposal.pdf'))).toBe(true);
  });

  it('should prefill complementary form controls on grouped demand', () => {
    expect(component.isAgrupado).toBe(true);
    expect(component.cotacaoForm.get('valorComplementar')?.value).toBe(1200);
    expect(component.cotacaoForm.get('ttColetaComplementar')?.value).toBe(12);
    expect(component.cotacaoForm.get('ttEntregaComplementar')?.value).toBe(24);
  });

  it('should disable form but keep status as Em Aprovação (not Cancelado or Finalizado) after quote submission', () => {
    component.cotacaoForm.patchValue({
      valorIndividual: 1500,
      ttColetaIndividual: 12,
      ttEntregaIndividual: 24,
      transportadora: 'MIRASSOL',
      valorComplementar: 1200,
      ttColetaComplementar: 12,
      ttEntregaComplementar: 24
    });
    component.confirmarEnvio();
    expect(component.camposDesabilitados).toBe(true);
    expect(component.frete?.status).toBe('Em Aprovação');
    expect(component.frete?.status === 'Cancelado' || component.frete?.status === 'Finalizado').toBe(false);
  });
});
