import { Component, OnInit } from '@angular/core';
import { TabsComponent } from '../tabs/tabs.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TestService } from '../../services/test.service';
import { Test } from '../../models/Test';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-test-editor',
  imports: [
    TabsComponent,
    CommonModule,
    FormsModule,
    RouterLink,
    NgbTooltipModule,
    NgxPaginationModule,
  ],
  standalone: true,
  templateUrl: './test-editor.component.html',
  styleUrl: './test-editor.component.css',
})
export class TestEditorComponent implements OnInit {
  constructor(private modal: NgbModal, private testService: TestService) {}

  testList: Test[] = [];
  newTest: Test = { title: '', description: '', status: true };
  idAux: number = 0;
  mode: 'create' | 'edit' = 'create';
  errorMessage: string = '';
  showError: boolean = false;

  ngOnInit(): void {
    this.getAllTests();
  }
  closeResult: string = '';
  itemsPerPage: number = 5; 
  p: number = 1;

  getAllTests() {
    this.testService.getAll().subscribe({
      next: (data) => {
        this.testList = data;
      },
    });
  }

  open(content: any, test?: Test) {
    this.hideError(); // Limpiar errores previos
    if (test && test.id) {
      this.idAux = test.id;
      this.newTest = { ...test };
      this.mode = 'edit';
    } else {
      this.mode = 'create';
      this.idAux = 0;
      this.newTest = { title: '', description: '', status: true };
    }

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

  createTest(): void {
    if (this.mode === 'create') {
      this.testService.save(this.newTest).subscribe({
        next: () => {
          this.getAllTests();
          this.newTest = { title: '', description: '', status: true }; // reset
          this.modal.dismissAll();
        },
        error: (err) => console.error('Error al crear test:', err),
      });
    } else if (this.mode === 'edit' && this.idAux) {
      this.testService.update(this.idAux, this.newTest).subscribe({
        next: () => {
          this.getAllTests();
          this.newTest = { title: '', description: '', status: true }; // reset
          this.idAux = 0;
          this.modal.dismissAll();
        },
        error: (err) => console.error('Error al actualizar test:', err),
      });
    }
  }

  deleteTest(id: number): void {
    this.hideError(); // Limpiar errores previos
    this.testService.deleteById(id).subscribe({
      next: () => {
        this.getAllTests();
        this.idAux = 0;
        this.modal.dismissAll();
      },
      error: (err) => {
        // Cerrar el modal de confirmación primero
        this.modal.dismissAll();
        
        if (err.status === 409) {
          this.showErrorAlert(err.error || 'No se puede eliminar el examen porque tiene preguntas asociadas');
        } else {
          console.error('Error al eliminar test:', err);
          this.showErrorAlert('Error inesperado al eliminar el examen');
        }
      },
    });
  }

  changeStatus(id?: number): void {
    if (!id) return; // si no hay id, no hacemos nada
    this.testService.changeStatus(id).subscribe({
      next: () => console.log('Estado actualizado'),
      error: (err) => console.error('Error al actualizar estado:', err),
    });
  }

  showErrorAlert(message: string): void {
    this.errorMessage = message;
    this.showError = true;
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      this.hideError();
    }, 5000);
  }

  hideError(): void {
    this.showError = false;
    this.errorMessage = '';
  }
}
