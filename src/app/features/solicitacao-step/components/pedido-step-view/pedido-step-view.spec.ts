import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoStepView } from './pedido-step-view';

describe('PedidoStepView', () => {
  let component: PedidoStepView;
  let fixture: ComponentFixture<PedidoStepView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidoStepView],
    }).compileComponents();

    fixture = TestBed.createComponent(PedidoStepView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
