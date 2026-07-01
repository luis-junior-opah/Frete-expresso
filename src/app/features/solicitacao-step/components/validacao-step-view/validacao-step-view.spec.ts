import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValidacaoStepView } from './validacao-step-view';
import { Frete } from '../../../../core/models/frete.model';
import { SimpleChange } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';

describe('ValidacaoStepView', () => {
  let component: ValidacaoStepView;
  let fixture: ComponentFixture<ValidacaoStepView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidacaoStepView],
    }).compileComponents();

    fixture = TestBed.createComponent(ValidacaoStepView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('parseDateTime', () => {
    it('should parse YYYY-MM-DD - HH:mm format', () => {
      const res = component.parseDateTime('2023-12-04 - 12:30');
      expect(res.date).toBe('2023-12-04');
      expect(res.time).toBe('12:30');
    });

    it('should parse DD/MM/YYYY - HH:mm format', () => {
      const res = component.parseDateTime('04/12/2023 - 12:30');
      expect(res.date).toBe('2023-12-04');
      expect(res.time).toBe('12:30');
    });

    it('should parse ISO format', () => {
      const res = component.parseDateTime('2023-12-04T12:30:00Z');
      expect(res.date).toBe('2023-12-04');
      expect(res.time).toBe('12:30');
    });

    it('should parse Date object', () => {
      const date = new Date(2023, 11, 4, 12, 30);
      const res = component.parseDateTime(date);
      expect(res.date).toBe('2023-12-04');
      expect(res.time).toBe('12:30');
    });

    it('should handle invalid string gracefully', () => {
      const res = component.parseDateTime('invalid string');
      expect(res.date).toBe('');
      expect(res.time).toBe('');
    });
  });

  describe('preencherCamposComFrete', () => {
    it('should prefill fields from frete input', () => {
      const mockFrete: Frete = {
        id: '21978',
        dataInicioJanela: '2023-12-04 - 12:30',
        dataFimJanela: '2023-12-04 - 14:30',
        dataNecessidadeEntrega: '2023-12-04 - 16:00',
        cliente: 'JOHN DEERE',
        fornecedor: 'BRUNING',
        status: 'Em andamento',
        etapa: 'Validação'
      } as any;

      component.frete = mockFrete;
      component.preencherCamposComFrete();

      expect(component.getFormattedDateString(component.dataInicioJanela)).toBe('2023-12-04');
      expect(component.horaInicioJanela).toBe('12:30');
      expect(component.getFormattedDateString(component.dataFimJanela)).toBe('2023-12-04');
      expect(component.horaFimJanela).toBe('14:30');
      expect(component.getFormattedDateString(component.dataNecessidadeEntrega)).toBe('2023-12-04');
      expect(component.horaNecessidadeEntrega).toBe('16:00');
      expect(component.hasInitializedFields).toBe(true);
    });

    it('should run prefill on ngOnChanges when frete changes', () => {
      const mockFrete: Frete = {
        id: '21978',
        dataInicioJanela: '2023-12-04 - 12:30',
        dataFimJanela: '2023-12-04 - 14:30',
        dataNecessidadeEntrega: '2023-12-04 - 16:00',
      } as any;

      component.frete = mockFrete;
      component.hasInitializedFields = false;

      component.ngOnChanges({
        frete: new SimpleChange(null, mockFrete, true)
      });

      expect(component.getFormattedDateString(component.dataInicioJanela)).toBe('2023-12-04');
      expect(component.hasInitializedFields).toBe(true);
    });
  });

  describe('sugestaoJanelas and salvarJanelas', () => {
    it('should compute sugestaoJanelas correctly when frete is set', () => {
      const mockFrete: Frete = {
        id: '21978',
        dataInicioJanela: '2023-12-04 - 12:30',
        dataFimJanela: '2023-12-04 - 14:30',
        dataNecessidadeEntrega: '2023-12-04 - 16:00',
      } as any;
      component.frete = mockFrete;

      const sug = component.sugestaoJanelas;
      expect(sug).toBeTruthy();
      expect(sug?.formattedInicio.date).toBeTruthy();
      expect(sug?.formattedInicio.time).toBeTruthy();
    });

    it('should apply sugestao to input properties', () => {
      const mockFrete: Frete = {
        id: '21978',
        dataInicioJanela: '2023-12-04 - 12:30',
        dataFimJanela: '2023-12-04 - 14:30',
        dataNecessidadeEntrega: '2023-12-04 - 16:00',
      } as any;
      component.frete = mockFrete;

      component.aplicarSugestao();
      const sug = component.sugestaoJanelas;
      expect(component.getFormattedDateString(component.dataInicioJanela)).toBe(sug?.formattedInicio.date);
      expect(component.horaInicioJanela).toBe(sug?.formattedInicio.time);
    });

    it('should persist changes when salvarJanelas is called', () => {
      const mockFrete: Frete = {
        id: '21978',
        dataInicioJanela: '2023-12-04 - 12:30',
        dataFimJanela: '2023-12-04 - 14:30',
        dataNecessidadeEntrega: '2023-12-04 - 16:00',
      } as any;
      component.frete = mockFrete;

      component.dataInicioJanela = '2026-07-02';
      component.horaInicioJanela = '10:00';
      component.dataFimJanela = '2026-07-02';
      component.horaFimJanela = '12:00';
      component.dataNecessidadeEntrega = '2026-07-02';
      component.horaNecessidadeEntrega = '18:00';

      component.salvarJanelas();
      expect(component.frete.dataInicioJanela).toBe('02/07/2026 10:00');
    });
  });
});

