import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprovacaoStepView } from './aprovacao-step-view';

describe('AprovacaoStepView', () => {
  let component: AprovacaoStepView;
  let fixture: ComponentFixture<AprovacaoStepView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AprovacaoStepView],
    }).compileComponents();

    fixture = TestBed.createComponent(AprovacaoStepView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
