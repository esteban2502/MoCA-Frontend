import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { QuestionService } from '../../services/question.service';
import { TestService } from '../../services/test.service';
import { AnswerService } from '../../services/answer.service';
import { ResultService } from '../../services/result.service';
import { UserEntityService } from '../../services/user-entity.service';
import { Question } from '../../models/Question';
import { Test } from '../../models/Test';
import { Answer } from '../../models/Answer';
import { Result } from '../../models/Result';
import { UserEntity, UserRegistrationRequest, UserLoginRequest } from '../../models/UserEntity';

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

  // User registration/login
  showUserForm = true;
  isRegistering = false;
  currentUser: UserEntity | null = null;
  
  // Registration form
  registrationForm: UserRegistrationRequest = {
    fullName: '',
    idNumber: '',
    academicLevel: '',
    birthDate: '',
    email: '',
    genero: '',
    notes: ''
  };
  
  // Login form
  loginForm: UserLoginRequest = {
    idNumber: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questionService: QuestionService,
    private testService: TestService,
    private answerService: AnswerService,
    private resultService: ResultService,
    private userEntityService: UserEntityService
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
        userId: this.currentUser?.id || null, // Usar null si no hay usuario
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

  // User registration/login methods
  toggleRegistrationMode(): void {
    this.isRegistering = !this.isRegistering;
    this.errorMessage = '';
    this.clearForms();
  }

  clearForms(): void {
    this.registrationForm = {
      fullName: '',
      idNumber: '',
      academicLevel: '',
      birthDate: '',
      email: '',
      genero: '',
      notes: ''
    };
    this.loginForm = {
      idNumber: ''
    };
  }

  async loginUser(): Promise<void> {
    if (!this.loginForm.idNumber.trim()) {
      this.errorMessage = 'Por favor ingrese su cédula';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const user = await firstValueFrom(this.userEntityService.findByCedula(this.loginForm.idNumber));
      this.currentUser = user;
      this.showUserForm = false;
      this.loadTestData();
    } catch (error) {
      console.error('Error buscando usuario:', error);
      this.errorMessage = 'Usuario no encontrado. Por favor regístrese primero.';
    } finally {
      this.isLoading = false;
    }
  }

  async registerUser(): Promise<void> {
    if (!this.validateRegistrationForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const user = await firstValueFrom(this.userEntityService.register(this.registrationForm));
      this.currentUser = user;
      this.showUserForm = false;
      this.loadTestData();
    } catch (error) {
      console.error('Error registrando usuario:', error);
      this.errorMessage = 'Error al registrar usuario. Intente nuevamente.';
    } finally {
      this.isLoading = false;
    }
  }

  validateRegistrationForm(): boolean {
    if (!this.registrationForm.fullName.trim()) {
      this.errorMessage = 'El nombre completo es requerido';
      return false;
    }
    if (!this.registrationForm.idNumber.trim()) {
      this.errorMessage = 'La cédula es requerida';
      return false;
    }
    if (!this.registrationForm.academicLevel.trim()) {
      this.errorMessage = 'El nivel académico es requerido';
      return false;
    }
    if (!this.registrationForm.birthDate) {
      this.errorMessage = 'La fecha de nacimiento es requerida';
      return false;
    }
    if (!this.registrationForm.email.trim()) {
      this.errorMessage = 'El email es requerido';
      return false;
    }
    if (!this.registrationForm.genero.trim()) {
      this.errorMessage = 'El género es requerido';
      return false;
    }
    return true;
  }

  goBackToUserForm(): void {
    this.showUserForm = true;
    this.currentUser = null;
    this.clearForms();
  }
}
