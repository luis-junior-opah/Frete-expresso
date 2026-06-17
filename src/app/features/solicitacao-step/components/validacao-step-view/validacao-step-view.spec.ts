import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidacaoStepView } from './validacao-step-view';

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
});
