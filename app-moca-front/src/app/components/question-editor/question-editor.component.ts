import { Component } from '@angular/core';
import { TabsComponent } from '../tabs/tabs.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-question-editor',
  imports: [TabsComponent],
  standalone:true,
  templateUrl: './question-editor.component.html',
  styleUrl: './question-editor.component.css'
})
export class QuestionEditorComponent {

  constructor(private modal: NgbModal){};

   closeResult: string = '';


    open(content: any) {
    

    this.modal
      .open(content, { size: 'md', ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with:${result} `;
        
        },
        (reason = close) => {
          this.closeResult = 'Dismissed';
        }
      );
  }

}
