import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CotacaoStepView } from './cotacao-step-view';

describe('CotacaoStepView', () => {
  let component: CotacaoStepView;
  let fixture: ComponentFixture<CotacaoStepView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CotacaoStepView],
    }).compileComponents();

    fixture = TestBed.createComponent(CotacaoStepView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
