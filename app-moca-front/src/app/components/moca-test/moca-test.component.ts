import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { QuestionService } from '../../services/question.service';
import { TestService } from '../../services/test.service';
import { AnswerService } from '../../services/answer.service';
import { ResultService } from '../../services/result.service';
import { Question } from '../../models/Question';
import { Test } from '../../models/Test';
import { Answer } from '../../models/Answer';
import { Result } from '../../models/Result';

interface LocalAnswer {
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
  answers: LocalAnswer[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questionService: QuestionService,
    private testService: TestService,
    private answerService: AnswerService,
    private resultService: ResultService
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
      firstValueFrom(this.testService.getAll()),
      firstValueFrom(this.questionService.getAllByTestId(this.testId))
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
    this.saveCurrentAnswer();
    this.saveTestResult();
  }

  saveTestResult(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('Iniciando guardado del test...');
    console.log('Test:', this.test);
    console.log('Answers a guardar:', this.answers);
    
    try {
      // Crear el payload para enviar al backend
      const resultPayload = {
        testId: this.test.id,
        answers: this.answers.map(localAnswer => ({
          questionId: localAnswer.questionId,
          userAnswer: localAnswer.userAnswer,
          score: localAnswer.score,
          notes: localAnswer.notes
        })),
        totalScore: this.calculateTotalScore(),
        evaluationDate: new Date().toISOString()
      };

      console.log('Payload a enviar:', resultPayload);

      // Guardar el resultado usando el endpoint que espera el formato correcto
      this.resultService.createFromPayload(resultPayload).subscribe({
        next: () => {
          console.log('Test completado y guardado exitosamente');
          this.router.navigate(['/evaluacion']);
        },
        error: (error) => {
          console.error('Error guardando resultado:', error);
          this.errorMessage = 'Error al guardar el resultado. Intente nuevamente.';
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error preparando datos:', error);
      this.errorMessage = 'Error al preparar los datos para guardar.';
      this.isLoading = false;
    }
  }

  calculateTotalScore(): number {
    return this.answers.reduce((total, answer) => {
      return total + (answer.score || 0);
    }, 0);
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
