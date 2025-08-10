import { Component } from '@angular/core';
import { TabsComponent } from '../tabs/tabs.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-test-editor',
  imports: [TabsComponent],
  standalone: true,
  templateUrl: './test-editor.component.html',
  styleUrl: './test-editor.component.css',
})
export class TestEditorComponent {
  constructor(private modal: NgbModal) {}
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
