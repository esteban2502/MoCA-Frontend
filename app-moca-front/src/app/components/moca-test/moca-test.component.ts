import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-moca-test',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './moca-test.component.html',
  styleUrl: './moca-test.component.css',
})
export class MocaTestComponent {
  // Datos de ejemplo para la maquetación visual
  currentQuestion = {
    id: 1,
    question: 'Dibuje un reloj que marque las 11:10',
    description: 'Instrucciones: Dibuje un círculo, coloque todos los números en las posiciones correctas y dibuje las manecillas para mostrar las 11:10.',
    questionOrder: 1,
    category: { name: 'Visuoconstrucción' },
    test: { id: 1, title: 'Prueba MoCA' }
  };
  
  totalQuestions = 10;
  currentQuestionNumber = 1;
  timeRemaining = '15:30';
  userAnswer = '';
  
  // Evaluation variables
  evaluationScore: number | null = null;
  evaluationNotes = '';
  
  isLoading = false;
  errorMessage = '';

  // Métodos vacíos para la maquetación
  goBack(): void {}
  nextQuestion(): void {}
  previousQuestion(): void {}
  submitAnswer(): void {}
  saveDraft(): void {}
  clearAnswer(): void {}
}
