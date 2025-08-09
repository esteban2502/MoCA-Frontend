import { Component } from '@angular/core';
import { TabsComponent } from '../tabs/tabs.component';

@Component({
  selector: 'app-question-editor',
  imports: [TabsComponent],
  standalone:true,
  templateUrl: './question-editor.component.html',
  styleUrl: './question-editor.component.css'
})
export class QuestionEditorComponent {

}
