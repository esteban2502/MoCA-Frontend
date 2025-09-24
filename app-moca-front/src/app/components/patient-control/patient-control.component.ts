import { Component } from '@angular/core';
import { TabsComponent } from '../tabs/tabs.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-patient-control',
  imports: [TabsComponent, NgbTooltipModule],
  standalone:true,
  templateUrl: './patient-control.component.html',
  styleUrl: './patient-control.component.css'
})
export class PatientControlComponent {

}
