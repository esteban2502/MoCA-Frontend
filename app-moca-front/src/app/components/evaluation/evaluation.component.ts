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
import { Answer } from '../../models/Answer';
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
    // Ordenar las respuestas según el orden de la pregunta en la prueba
    const sortedAnswers: Answer[] = (result.answers || []).slice().sort((a, b) => {
      const qa = a.question;
      const qb = b.question;
      const orderA = qa?.questionOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = qb?.questionOrder ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      const idA = qa?.id ?? 0;
      const idB = qb?.id ?? 0;
      return idA - idB;
    });

    // Construir la vista de tabla dinámica para cada respuesta (si aplica)
    sortedAnswers.forEach((ans: Answer) => {
      ans.dynamicTableView = this.buildDynamicTableView(ans);
    });

    // Usar una copia del resultado con las respuestas ya ordenadas
    this.selectedResult = {
      ...result,
      answers: sortedAnswers
    };
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

  /** Construye un objeto de vista para la tabla dinámica (columnas, filas y celdas marcadas). */
  private buildDynamicTableView(answer: Answer): { columns: string[]; rows: string[]; selection: { [key: string]: boolean } } | null {
    const question = answer.question;
    if (!question || !question.dynamicTableConfig) {
      return null;
    }

    let columns: string[] = [];
    let rows: string[] = [];
    try {
      const cfg = JSON.parse(question.dynamicTableConfig);
      columns = Array.isArray(cfg.columns) ? cfg.columns.slice() : [];
      rows = Array.isArray(cfg.rows) ? cfg.rows.slice() : [];
    } catch (e) {
      console.error('Error parseando dynamicTableConfig en evaluación:', e);
      return null;
    }

    const selection: { [key: string]: boolean } = {};
    if (answer.dynamicTableResponse) {
      try {
        const parsed = JSON.parse(answer.dynamicTableResponse);
        if (parsed && typeof parsed === 'object') {
          for (const key of Object.keys(parsed)) {
            const v = parsed[key];
            selection[key] = v === true || v === 'true' || v === 1;
          }
        }
      } catch (e) {
        console.error('Error parseando dynamicTableResponse en evaluación:', e);
      }
    }

    return { columns, rows, selection };
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

  // Método para exportar evaluaciones a Excel
  exportToExcel(): void {
    this.resultService.exportToExcel().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `evaluaciones_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        console.log('✅ Archivo Excel descargado exitosamente');
      },
      error: (error: any) => {
        console.error('❌ Error exportando a Excel:', error);
        alert('Error al exportar el archivo Excel');
      }
    });
  }
}
