import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AcompanhamentoPanel } from './acompanhamento-panel';

describe('AcompanhamentoPanel', () => {
  let component: AcompanhamentoPanel;
  let fixture: ComponentFixture<AcompanhamentoPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcompanhamentoPanel],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            url: of([])
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AcompanhamentoPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
