import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockManagement } from './stock-management';

describe('StockManagement', () => {
  let component: StockManagement;
  let fixture: ComponentFixture<StockManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(StockManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
