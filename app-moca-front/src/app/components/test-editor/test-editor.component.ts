import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { TabsComponent } from '../tabs/tabs.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TestService } from '../../services/test.service';
import { Test } from '../../models/Test';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { AuthService } from '../../services/auth.service';

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
  @ViewChild('errorModal', { static: true }) errorModal!: TemplateRef<any>;

  constructor(private modal: NgbModal, private testService: TestService, private authService: AuthService, private router: Router) {}

  testList: Test[] = [];
  newTest: Test = { title: '', description: '', status: true };
  idAux: number = 0;
  mode: 'create' | 'edit' = 'create';
  testToDelete: Test | null = null;

  ngOnInit(): void {
    this.getAllTests();
  }
  closeResult: string = '';
  itemsPerPage: number = 5; 
  p: number = 1;

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getAllTests() {
    this.testService.getAll().subscribe({
      next: (data) => {
        this.testList = data;
      },
    });
  }

  open(content: any, test?: Test) {
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
    // Buscar la prueba en la lista para verificar si tiene preguntas
    const test = this.testList.find(t => t.id === id);
    
    if (test && test.numQuestions && test.numQuestions > 0) {
      // Si la prueba tiene preguntas, mostrar modal de error
      this.testToDelete = test;
      this.modal.dismissAll(); // Cerrar modal de confirmación
      this.openErrorModal();
      return;
    }
    
    this.testService.deleteById(id).subscribe({
      next: () => {
        this.getAllTests();
        this.idAux = 0;
        this.modal.dismissAll();
      }, // refresca lista
      error: (err) => console.error('Error al eliminar test:', err),
    });
  }

  openErrorModal(): void {
    this.modal.open(this.errorModal, { size: 'md', ariaLabelledBy: 'error-modal-title' });
  }

  goToQuestions(): void {
    if (this.testToDelete?.id) {
      // Navegar a la página de preguntas de la prueba
      this.router.navigate(['/preguntas', this.testToDelete.id]);
    }
  }

  changeStatus(id?: number): void {
    if (!id) return; // si no hay id, no hacemos nada
    this.testService.changeStatus(id).subscribe({
      next: () => console.log('Estado actualizado'),
      error: (err) => console.error('Error al actualizar estado:', err),
    });
  }
}
