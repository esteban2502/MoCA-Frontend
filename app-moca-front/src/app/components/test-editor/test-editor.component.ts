import { Component } from '@angular/core';
import { TabsComponent } from '../tabs/tabs.component';

@Component({
  selector: 'app-test-editor',
  imports: [TabsComponent],
  standalone:true,
  templateUrl: './test-editor.component.html',
  styleUrl: './test-editor.component.css'
})
export class TestEditorComponent {

}
