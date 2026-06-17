import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { HistoricoView } from './historico-view';

describe('HistoricoView', () => {
  let component: HistoricoView;
  let fixture: ComponentFixture<HistoricoView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoView],
      providers: [
        provideRouter([]),
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
});
