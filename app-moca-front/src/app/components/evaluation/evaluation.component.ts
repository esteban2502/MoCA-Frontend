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
    private router: Router,
  ) {}

  pageSize = 5;
  displayedExams: Test[] = [];
  results: Result[] = [];
  selectedResult: Result | null = null;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.getAllTests();
    this.getAllResults();
  }

  itemsPerPage: number = 5; 
  p: number = 1;

  // Texto de búsqueda para evaluaciones
  searchTerm: string = '';

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
    
    this.resultService.getMyResults().subscribe({
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

  viewResult(content: any, result: Result) {
    console.log('Resultado seleccionado:', result);
    console.log('Answers del resultado:', result.answers);
    if (result.answers && result.answers.length > 0) {
      console.log('Primera respuesta:', result.answers[0]);
      console.log('Question de la primera respuesta:', result.answers[0].question);
    }
    
    this.selectedResult = result;
    this.modal
      .open(content, { size: 'lg', ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        (result) => {
          this.closeResult = `Closed with:${result} `;
          this.selectedResult = null;
        },
        (reason = close) => {
          this.closeResult = 'Dismissed';
          this.selectedResult = null;
        }
      );
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

  // Lista filtrada por paciente, test, fecha (insensible a mayúsculas)
  get filteredResults(): Result[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.results;
    return this.results.filter((result) => {
      const patientName = (result.patient?.fullName || '').toLowerCase();
      const patientId = (result.patient?.documentNumber || '').toString().toLowerCase();
      const testName = (result.test?.title || '').toLowerCase();
      const date = result.evaluationDate ? new Date(result.evaluationDate).toLocaleDateString('es-ES').toLowerCase() : '';
      
      return patientName.includes(term) || 
             patientId.includes(term) || 
             testName.includes(term) || 
             date.includes(term);
    });
  }

  onSearchChange(): void {
    // Reiniciar a la primera página al cambiar el filtro
    this.p = 1;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.p = 1;
  }
}
