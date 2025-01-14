import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelineationComponent } from './delineation.component';

describe('DelineationComponent', () => {
  let component: DelineationComponent;
  let fixture: ComponentFixture<DelineationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DelineationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DelineationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
