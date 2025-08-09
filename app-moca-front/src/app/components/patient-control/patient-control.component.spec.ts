import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientControlComponent } from './patient-control.component';

describe('PatientControlComponent', () => {
  let component: PatientControlComponent;
  let fixture: ComponentFixture<PatientControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
