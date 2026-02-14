import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
import { Patient } from '../../models/Patient';
import { PatientService } from '../../services/patient.service';

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
export class MocaTestComponent implements OnInit, AfterViewInit {
  @ViewChild('drawingCanvas') drawingCanvas!: ElementRef<HTMLCanvasElement>;
  
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
  
  // Score validation state
  showScoreWarning = false;
  
  // State management
  isLoading = false;
  errorMessage = '';
  
  // Answers storage
  answers: LocalAnswer[] = [];
  
  // Drawing canvas properties
  private canvasContext!: CanvasRenderingContext2D | null;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  drawingTool: 'pen' | 'eraser' = 'pen';
  private lineWidth = 3;

  // Patient selection
  selectedPatient: Patient | null = null;

  // Patient login/registration form state
  showUserForm = true;
  isRegistering = false;
  
  // Registration form (map to patient fields)
  registrationForm = {
    fullName: '',
    idNumber: '',
    birthDate: ''
  };
  
  // Login form (documentNumber)
  loginForm = {
    idNumber: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questionService: QuestionService,
    private testService: TestService,
    private answerService: AnswerService,
    private resultService: ResultService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.testId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.testId) {
      this.errorMessage = 'ID de prueba no válido';
      return;
    }
    this.loadTestData();
  }

  ngAfterViewInit(): void {
    // Initialize canvas after view is ready (solo si hay una pregunta de dibujo)
    if (this.currentQuestion?.isDrawing) {
      setTimeout(() => {
        this.initializeCanvas();
        this.loadDrawingFromAnswer();
      }, 200);
    }
  }

  loadTestData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Cargar datos del test y preguntas activas en paralelo
    Promise.all([
      firstValueFrom(this.testService.getAll()),
      firstValueFrom(this.questionService.getActiveByTestId(this.testId))
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
    
    // Reset warning state
    this.showScoreWarning = false;
    
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
    
    // Initialize canvas for drawing questions
    if (this.currentQuestion.isDrawing) {
      // Usar setTimeout más largo para asegurar que el DOM esté completamente renderizado
      setTimeout(() => {
        if (this.drawingCanvas && this.currentQuestion.isDrawing) {
          this.initializeCanvas();
          // Cargar dibujo guardado después de inicializar
          setTimeout(() => {
            if (this.userAnswer) {
              this.loadDrawingFromAnswer();
            }
          }, 50);
        }
      }, 300);
    } else {
      // Reset drawing tool when switching to non-drawing question
      this.drawingTool = 'pen';
    }
  }

  saveCurrentAnswer(): void {
    // Save drawing if it's a drawing question
    if (this.currentQuestion.isDrawing && this.canvasContext) {
      this.saveDrawingToAnswer();
    }
    
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
    if (!this.selectedPatient) {
      this.errorMessage = 'Seleccione o registre un paciente antes de finalizar.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      const resultPayload = {
        testId: this.test.id,
        userId: null, // legacy
        patientId: this.selectedPatient.id,
        answers: this.answers.map(localAnswer => ({
          questionId: localAnswer.questionId,
          userAnswer: localAnswer.userAnswer,
          score: localAnswer.score,
          notes: localAnswer.notes
        })),
        totalScore: this.calculateTotalScore(),
        evaluationDate: new Date().toISOString()
      };

      this.resultService.createFromPayload(resultPayload).subscribe({
        next: () => {
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

  // Manejar input en tiempo real
  onScoreInput(event: any): void {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      if (value > this.maxScore) {
        this.showScoreWarning = true;
        // Usar setTimeout para que Angular detecte el cambio
        setTimeout(() => {
          this.evaluationScore = this.maxScore;
        }, 0);
        // Ocultar la advertencia después de 3 segundos
        setTimeout(() => {
          this.showScoreWarning = false;
        }, 3000);
      } else if (value < 0) {
        setTimeout(() => {
          this.evaluationScore = 0;
        }, 0);
      } else {
        this.showScoreWarning = false;
      }
    }
  }

  get canGoNext(): boolean {
    return this.currentQuestionIndex < this.questions.length - 1;
  }

  get canGoPrevious(): boolean {
    return this.currentQuestionIndex > 0;
  }

  // Patient login/registration
  toggleRegistrationMode(): void {
    this.isRegistering = !this.isRegistering;
    this.errorMessage = '';
    this.clearForms();
  }

  clearForms(): void {
    this.registrationForm = {
      fullName: '',
      idNumber: '',
      birthDate: ''
    };
    this.loginForm = {
      idNumber: ''
    };
  }

  async loginUser(): Promise<void> {
    if (!this.loginForm.idNumber.trim()) {
      this.errorMessage = 'Por favor ingrese la cédula del paciente';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const patient = await firstValueFrom(this.patientService.findByDocument(this.loginForm.idNumber));
      this.selectedPatient = patient;
      this.showUserForm = false;
      this.loadTestData();
    } catch (error) {
      console.error('Error buscando paciente:', error);
      this.errorMessage = 'Paciente no encontrado. Por favor regístrelo primero.';
    } finally {
      this.isLoading = false;
    }
  }

  async registerUser(): Promise<void> {
    if (!this.registrationForm.fullName.trim() || !this.registrationForm.idNumber.trim()) {
      this.errorMessage = 'Nombre y cédula son requeridos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const patient = await firstValueFrom(this.patientService.create({
        fullName: this.registrationForm.fullName,
        documentNumber: this.registrationForm.idNumber,
        birthDate: this.registrationForm.birthDate
      }));
      this.selectedPatient = patient;
      this.showUserForm = false;
      this.loadTestData();
    } catch (error) {
      console.error('Error registrando paciente:', error);
      this.errorMessage = 'Error al registrar paciente. Intente nuevamente.';
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
    if (!this.registrationForm.birthDate) {
      this.errorMessage = 'La fecha de nacimiento es requerida';
      return false;
    }
    return true;
  }

  goBackToUserForm(): void {
    this.showUserForm = true;
    this.selectedPatient = null;
    this.clearForms();
  }

  // Drawing Canvas Methods
  initializeCanvas(): void {
    if (!this.drawingCanvas || !this.currentQuestion?.isDrawing) {
      return;
    }

    const canvas = this.drawingCanvas.nativeElement;
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    const container = canvas.parentElement;
    
    if (container) {
      // Aumentar el tamaño del canvas para mejor espacio de dibujo
      const containerWidth = container.clientWidth - 40; // Account for padding
      const maxWidth = 900; // Ancho máximo recomendado
      const minWidth = 600; // Ancho mínimo
      
      const canvasWidth = Math.max(minWidth, Math.min(maxWidth, containerWidth));
      const canvasHeight = 600; // Altura aumentada para mejor espacio de dibujo
      
      // Establecer el tamaño real del canvas (sin escalado CSS)
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      // El tamaño CSS debe coincidir con el tamaño real para evitar problemas de escalado
      canvas.style.width = canvasWidth + 'px';
      canvas.style.height = canvasHeight + 'px';
    }

    this.canvasContext = canvas.getContext('2d');
    if (!this.canvasContext) {
      console.error('Could not get 2D context from canvas');
      return;
    }

    // Configurar el contexto del canvas
    this.canvasContext.strokeStyle = '#000000';
    this.canvasContext.lineWidth = this.lineWidth;
    this.canvasContext.lineCap = 'round';
    this.canvasContext.lineJoin = 'round';
    this.canvasContext.globalCompositeOperation = 'source-over';
    
    // Set white background
    this.canvasContext.fillStyle = '#ffffff';
    this.canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    
    // Asegurar que el tool esté configurado correctamente
    this.setDrawingTool(this.drawingTool);
  }

  startDrawing(event: MouseEvent): void {
    // Verificar que todo esté listo
    if (!this.drawingCanvas || !this.currentQuestion?.isDrawing) {
      // Si el canvas no está inicializado, intentar inicializarlo
      if (this.currentQuestion?.isDrawing && this.drawingCanvas) {
        this.initializeCanvas();
        // Esperar un momento para que se inicialice
        setTimeout(() => {
          this.startDrawing(event);
        }, 50);
        return;
      }
      return;
    }
    
    if (!this.canvasContext) {
      this.initializeCanvas();
      if (!this.canvasContext) return;
    }
    
    event.preventDefault();
    event.stopPropagation();
    
    this.isDrawing = true;
    const canvas = this.drawingCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    
    // Calcular coordenadas relativas al canvas
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Si hay escalado CSS, ajustar las coordenadas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    this.lastX = x * scaleX;
    this.lastY = y * scaleY;
    
    // Iniciar el trazo desde este punto y dibujar un punto inicial
    this.canvasContext.beginPath();
    this.canvasContext.moveTo(this.lastX, this.lastY);
    this.canvasContext.lineTo(this.lastX + 0.1, this.lastY + 0.1); // Pequeño punto inicial
    this.canvasContext.stroke();
  }

  draw(event: MouseEvent): void {
    if (!this.isDrawing || !this.canvasContext || !this.currentQuestion?.isDrawing) {
      return;
    }
    
    event.preventDefault();
    event.stopPropagation();
    
    const canvas = this.drawingCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    
    // Calcular coordenadas relativas al canvas
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Si hay escalado CSS, ajustar las coordenadas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const currentX = x * scaleX;
    const currentY = y * scaleY;

    // Dibujar línea desde la última posición a la actual
    this.canvasContext.lineTo(currentX, currentY);
    this.canvasContext.stroke();

    this.lastX = currentX;
    this.lastY = currentY;
  }

  stopDrawing(): void {
    if (this.isDrawing && this.currentQuestion.isDrawing) {
      this.saveDrawingToAnswer();
    }
    this.isDrawing = false;
  }

  startDrawingTouch(event: TouchEvent): void {
    if (!this.canvasContext || !this.currentQuestion.isDrawing) return;
    
    event.preventDefault();
    this.isDrawing = true;
    const canvas = this.drawingCanvas.nativeElement;
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    
    // Calcular coordenadas relativas al canvas
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Si hay escalado CSS, ajustar las coordenadas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    this.lastX = x * scaleX;
    this.lastY = y * scaleY;
    
    // Iniciar el trazo desde este punto
    this.canvasContext.beginPath();
    this.canvasContext.moveTo(this.lastX, this.lastY);
  }

  drawTouch(event: TouchEvent): void {
    if (!this.isDrawing || !this.canvasContext || !this.currentQuestion.isDrawing) return;
    
    event.preventDefault();
    const canvas = this.drawingCanvas.nativeElement;
    const touch = event.touches[0];
    const rect = canvas.getBoundingClientRect();
    
    // Calcular coordenadas relativas al canvas
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Si hay escalado CSS, ajustar las coordenadas
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const currentX = x * scaleX;
    const currentY = y * scaleY;

    // Dibujar línea desde la última posición a la actual
    this.canvasContext.lineTo(currentX, currentY);
    this.canvasContext.stroke();

    this.lastX = currentX;
    this.lastY = currentY;
  }

  setDrawingTool(tool: 'pen' | 'eraser'): void {
    this.drawingTool = tool;
    if (this.canvasContext) {
      if (tool === 'pen') {
        this.canvasContext.strokeStyle = '#000000';
        this.canvasContext.globalCompositeOperation = 'source-over';
      } else {
        this.canvasContext.strokeStyle = '#ffffff';
        this.canvasContext.globalCompositeOperation = 'destination-out';
      }
    }
  }

  clearCanvas(): void {
    if (!this.canvasContext || !this.drawingCanvas) return;
    
    const canvas = this.drawingCanvas.nativeElement;
    this.canvasContext.fillStyle = '#ffffff';
    this.canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    this.userAnswer = '';
  }

  saveDrawingToAnswer(): void {
    if (!this.drawingCanvas || !this.currentQuestion.isDrawing) return;
    
    const canvas = this.drawingCanvas.nativeElement;
    const imageData = canvas.toDataURL('image/png');
    this.userAnswer = imageData;
  }

  loadDrawingFromAnswer(): void {
    if (!this.userAnswer || !this.canvasContext || !this.drawingCanvas || !this.currentQuestion.isDrawing) {
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = this.drawingCanvas.nativeElement;
      if (this.canvasContext) {
        this.canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        this.canvasContext.drawImage(img, 0, 0);
      }
    };
    img.src = this.userAnswer;
  }
}
