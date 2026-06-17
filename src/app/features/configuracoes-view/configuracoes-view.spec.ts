import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracoesView } from './configuracoes-view';

describe('ConfiguracoesView', () => {
  let component: ConfiguracoesView;
  let fixture: ComponentFixture<ConfiguracoesView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracoesView],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguracoesView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
