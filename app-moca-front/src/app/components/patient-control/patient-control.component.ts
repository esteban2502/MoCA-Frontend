import { Component } from '@angular/core';
import { TabsComponent } from '../tabs/tabs.component';

@Component({
  selector: 'app-patient-control',
  imports: [TabsComponent],
  standalone:true,
  templateUrl: './patient-control.component.html',
  styleUrl: './patient-control.component.css'
})
export class PatientControlComponent {

}
