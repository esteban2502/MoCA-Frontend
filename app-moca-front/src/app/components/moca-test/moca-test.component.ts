import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from '../../services/question.service';
import { TestService } from '../../services/test.service';
import { Question } from '../../models/Question';
import { Test } from '../../models/Test';

interface Answer {
  questionId: number;
  userAnswer: string;
  score: number | null;
  notes: string;
}

@Component({
  selector: 'app-moca-test',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './moca-test.component.html',
  styleUrl: './moca-test.component.css',
})
export class MocaTestComponent implements OnInit {
  testId!: number;
  test!: Test;
  questions: Question[] = [];
  currentQuestionIndex = 0;
  
  // Current question data
  currentQuestion!: Question;
  totalQuestions = 0;
  currentQuestionNumber = 1;
  
  // User inputs
  userAnswer = '';
  evaluationScore: number | null = null;
  evaluationNotes = '';
  
  // State management
  isLoading = false;
  errorMessage = '';
  
  // Answers storage
  answers: Answer[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questionService: QuestionService,
    private testService: TestService
  ) {}

  ngOnInit(): void {
    this.testId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.testId) {
      this.errorMessage = 'ID de prueba no válido';
      return;
    }
    this.loadTestData();
  }

  loadTestData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Cargar datos del test y preguntas en paralelo
    Promise.all([
      this.testService.getAll().toPromise(),
      this.questionService.getAllByTestId(this.testId).toPromise()
    ]).then(([tests, questions]) => {
      if (tests && questions) {
        this.test = tests.find(t => t.id === this.testId)!;
        this.questions = questions.sort((a, b) => (a.questionOrder || 0) - (b.questionOrder || 0));
        
        if (this.questions.length === 0) {
          this.errorMessage = 'No hay preguntas disponibles para esta prueba';
          return;
        }
        
        this.totalQuestions = this.questions.length;
        this.currentQuestion = this.questions[0];
        this.currentQuestionNumber = 1;
        
        // Inicializar respuestas
        this.initializeAnswers();
      }
    }).catch(error => {
      console.error('Error cargando datos:', error);
      this.errorMessage = 'Error al cargar la prueba. Intente nuevamente.';
    }).finally(() => {
      this.isLoading = false;
    });
  }

  initializeAnswers(): void {
    this.answers = this.questions.map(q => ({
      questionId: q.id!,
      userAnswer: '',
      score: null,
      notes: ''
    }));
  }

  goBack(): void {
    this.router.navigate(['/evaluacion']);
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.saveCurrentAnswer();
      this.currentQuestionIndex++;
      this.loadQuestion();
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.saveCurrentAnswer();
      this.currentQuestionIndex--;
      this.loadQuestion();
    }
  }

  loadQuestion(): void {
    this.currentQuestion = this.questions[this.currentQuestionIndex];
    this.currentQuestionNumber = this.currentQuestionIndex + 1;
    
    // Cargar respuesta guardada si existe
    const savedAnswer = this.answers.find(a => a.questionId === this.currentQuestion.id);
    if (savedAnswer) {
      this.userAnswer = savedAnswer.userAnswer;
      this.evaluationScore = savedAnswer.score;
      this.evaluationNotes = savedAnswer.notes;
    } else {
      this.userAnswer = '';
      this.evaluationScore = null;
      this.evaluationNotes = '';
    }
  }

  saveCurrentAnswer(): void {
    const answerIndex = this.answers.findIndex(a => a.questionId === this.currentQuestion.id);
    if (answerIndex !== -1) {
      this.answers[answerIndex] = {
        questionId: this.currentQuestion.id!,
        userAnswer: this.userAnswer,
        score: this.evaluationScore,
        notes: this.evaluationNotes
      };
    }
  }

  submitAnswer(): void {
    this.saveCurrentAnswer();
    
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.nextQuestion();
    } else {
      this.finishTest();
    }
  }

  finishTest(): void {
    // Aquí puedes implementar la lógica para guardar todas las respuestas
    console.log('Test completado. Respuestas:', this.answers);
    // Por ahora, redirigir de vuelta
    this.router.navigate(['/evaluacion']);
  }

  clearAnswer(): void {
    this.userAnswer = '';
    this.evaluationScore = null;
    this.evaluationNotes = '';
  }

  // Getters para el template
  get maxScore(): number {
    return this.currentQuestion?.maxScore || 10;
  }

  get canGoNext(): boolean {
    return this.currentQuestionIndex < this.questions.length - 1;
  }

  get canGoPrevious(): boolean {
    return this.currentQuestionIndex > 0;
  }
}
