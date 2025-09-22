import { Component, OnInit } from '@angular/core';
import { TabsComponent } from '../tabs/tabs.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TestService } from '../../services/test.service';
import { Test } from '../../models/Test';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';

@Component({
  selector: 'app-evaluation',
  imports: [TabsComponent, CommonModule, FormsModule, NgbTooltipModule,InfiniteScrollDirective ],
  templateUrl: './evaluation.component.html',
  standalone: true,
  styleUrl: './evaluation.component.css',
})
export class EvaluationComponent implements OnInit {
  closeResult: string = '';
  constructor(private modal: NgbModal, private testService: TestService) {}

  pageSize = 5;
  displayedExams: Test[] = [];

  ngOnInit(): void {
    this.getAllTests();
  }

  testList: Test[] = [];

  getAllTests() {
    this.testService.getAll().subscribe({
      next: (data) => {
        this.testList = data;
        this.loadMore();
      },
    });
  }

  loadMore() {
    const nextItems = this.testList.slice(
      this.displayedExams.length,
      this.displayedExams.length + this.pageSize
    );
    this.displayedExams = [...this.displayedExams, ...nextItems];
  }

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
