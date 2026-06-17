import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { AprovacaoStep } from './aprovacao-step';

registerLocaleData(localePt);

describe('AprovacaoStep', () => {
  let component: AprovacaoStep;
  let fixture: ComponentFixture<AprovacaoStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AprovacaoStep],
      providers: [
        provideAnimationsAsync(),
        { provide: LOCALE_ID, useValue: 'pt-BR' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AprovacaoStep);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
