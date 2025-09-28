import { Component, OnInit } from '@angular/core';
import { TabsComponent } from '../tabs/tabs.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { TestService } from '../../services/test.service';
import { ResultService } from '../../services/result.service';
import { Test } from '../../models/Test';
import { Result } from '../../models/Result';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-evaluation',
  imports: [TabsComponent, CommonModule, FormsModule, NgbTooltipModule,InfiniteScrollDirective,NgxPaginationModule ],
  templateUrl: './evaluation.component.html',
  standalone: true,
  styleUrl: './evaluation.component.css',
})
export class EvaluationComponent implements OnInit {
  closeResult: string = '';
  constructor(
    private modal: NgbModal, 
    private testService: TestService,
    private resultService: ResultService,
    private router: Router
  ) {}

  pageSize = 5;
  displayedExams: Test[] = [];
  results: Result[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.getAllTests();
    this.getAllResults();
  }

  itemsPerPage: number = 5; 
  p: number = 1;

  testList: Test[] = [];

  getAllTests() {
    this.testService.getAll().subscribe({
      next: (data) => {
        // Filtrar solo los exámenes con status true
        this.testList = data.filter(test => test.status === true);
        this.loadMore();
      },
    });
  }

  getAllResults() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.resultService.getAll().subscribe({
      next: (data) => {
        this.results = data;
        this.isLoading = false;
        console.log('Resultados cargados:', this.results);
      },
      error: (error) => {
        console.error('Error cargando resultados:', error);
        this.errorMessage = 'Error al cargar los resultados';
        this.isLoading = false;
      }
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

  startTest(testId: number) {
    this.modal.dismissAll();
    this.router.navigate(['/moca-test', testId]);
  }

  viewResult(result: Result) {
    console.log('Ver detalles del resultado:', result);
    // Aquí puedes implementar un modal para mostrar los detalles
    // o navegar a una página de detalles
  }

  deleteResult(resultId: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta evaluación?')) {
      this.resultService.delete(resultId).subscribe({
        next: () => {
          console.log('Resultado eliminado exitosamente');
          this.getAllResults(); // Recargar la lista
        },
        error: (error) => {
          console.error('Error eliminando resultado:', error);
          alert('Error al eliminar la evaluación');
        }
      });
    }
  }
}
