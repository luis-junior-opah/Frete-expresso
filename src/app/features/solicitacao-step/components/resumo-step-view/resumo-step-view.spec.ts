import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumoStepView } from './resumo-step-view';

describe('ResumoStepView', () => {
  let component: ResumoStepView;
  let fixture: ComponentFixture<ResumoStepView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumoStepView],
    }).compileComponents();

    fixture = TestBed.createComponent(ResumoStepView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
