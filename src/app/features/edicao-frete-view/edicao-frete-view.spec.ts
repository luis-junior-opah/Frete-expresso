import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { EdicaoFreteView } from './edicao-frete-view';

describe('EdicaoFreteView', () => {
  let component: EdicaoFreteView;
  let fixture: ComponentFixture<EdicaoFreteView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdicaoFreteView],
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

    fixture = TestBed.createComponent(EdicaoFreteView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
