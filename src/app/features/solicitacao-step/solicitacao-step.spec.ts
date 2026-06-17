import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitacaoStep } from './solicitacao-step';

describe('SolicitacaoStep', () => {
  let component: SolicitacaoStep;
  let fixture: ComponentFixture<SolicitacaoStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitacaoStep],
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitacaoStep);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
