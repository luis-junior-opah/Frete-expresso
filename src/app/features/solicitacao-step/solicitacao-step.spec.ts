import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { SolicitacaoStep } from './solicitacao-step';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('SolicitacaoStep', () => {
  let component: SolicitacaoStep;
  let fixture: ComponentFixture<SolicitacaoStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitacaoStep],
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

    fixture = TestBed.createComponent(SolicitacaoStep);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
