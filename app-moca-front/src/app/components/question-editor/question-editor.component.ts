import { Component, OnInit } from '@angular/core';
import { TabsComponent } from '../tabs/tabs.component';
import { NgbModal, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { QuestionService } from '../../services/question.service';
import { Question } from '../../models/Question';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Category } from '../../models/Category';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-question-editor',
  imports: [
    TabsComponent,
    CommonModule,
    FormsModule,
    NgbTooltipModule,
    NgxPaginationModule,
  ],
  standalone: true,
  templateUrl: './question-editor.component.html',
  styleUrl: './question-editor.component.css',
})
export class QuestionEditorComponent implements OnInit {
  testId!: number;
  questions: Question[] = [];
  newQuestion: Question = {
    question: '',
    description: '',
    questionOrder: 1,
    maxScore: 1,
    test: { id: this.testId },
    category: { id: 0 }
  };
  idAux: number = 0;
  mode: 'create' | 'edit' = 'create';
  errorMessage: string = '';

  constructor(
    private modal: NgbModal,
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.testId = Number(this.route.snapshot.paramMap.get('id'));
    this.getAllQuestions();
    this.loadCategories();
  }
  closeResult: string = '';

  itemsPerPage: number = 8;
  p: number = 1;

  categories: Category[] = [];

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => (this.categories = data),
      error: (err) => console.error('Error cargando categorías', err),
    });
  }

  open(content: any, question?: Question) {
    this.errorMessage = ''; // Limpiar mensaje de error
    if (question && question.id) {
      this.idAux = question.id;
      this.newQuestion = { ...question };
      this.mode = 'edit';
    } else {
      this.mode = 'create';
      this.idAux = 0;
      this.newQuestion = {
        question: '',
        description: '',
        questionOrder: 1,
        maxScore: 1,
        test: { id: this.testId },
        category: { id: 0 }
      };
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

  getAllQuestions(): void {
    this.questionService.getAllByTestId(this.testId).subscribe({
      next: (data) => {
        this.questions = data;
      },
      error: (err) => {
        console.error('Error cargando preguntas', err);
      },
    });
  }

  createQuestion(): void {
    this.errorMessage = ''; // Limpiar mensaje de error previo
    
    if (this.mode === 'create') {
      this.newQuestion.test.id = this.testId;
      this.questionService.create(this.newQuestion).subscribe({
        next: () => {
          this.getAllQuestions();
          this.newQuestion = {
            question: '',
            description: '',
            questionOrder: 1,
            maxScore: 1,
            test: { id: this.testId },
            category: { id: 0 }
          };
          this.modal.dismissAll();
        },
        error: (err) => {
          if (err.status === 409) {
            this.errorMessage = err.error || 'Ya existe una pregunta con este orden en el examen';
          } else {
            console.error('Error al crear pregunta:', err);
            this.errorMessage = 'Error al crear la pregunta';
          }
        },
      });
    } else if (this.mode === 'edit' && this.idAux) {
      this.questionService.update(this.idAux, this.newQuestion).subscribe({
        next: () => {
          this.getAllQuestions();
          this.newQuestion = {
            question: '',
            description: '',
            questionOrder: 1,
            maxScore: 1,
            test: { id: this.testId },
            category: { id: 0 }
          };
          this.idAux = 0;
          this.modal.dismissAll();
        },
        error: (err) => {
          if (err.status === 409) {
            this.errorMessage = err.error || 'Ya existe una pregunta con este orden en el examen';
          } else {
            console.error('Error al actualizar pregunta:', err);
            this.errorMessage = 'Error al actualizar la pregunta';
          }
        },
      });
    }
  }

  deleteQuestion(id: number): void {
    this.questionService.delete(id).subscribe({
      next: () => {
        this.getAllQuestions();
        this.idAux = 0;
        this.modal.dismissAll();
      },
      error: (err) => console.error('Error al eliminar pregunta:', err),
    });
  }

  
}
