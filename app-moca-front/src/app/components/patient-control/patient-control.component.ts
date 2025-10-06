import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TabsComponent } from '../tabs/tabs.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/Patient';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-patient-control',
  imports: [TabsComponent, NgbTooltipModule, CommonModule, NgxPaginationModule, FormsModule],
  standalone: true,
  templateUrl: './patient-control.component.html',
  styleUrl: './patient-control.component.css'
})
export class PatientControlComponent implements OnInit {
  patients: Patient[] = [];
  isLoading = false;
  errorMessage = '';

  itemsPerPage: number = 5;
  p: number = 1;

  // Texto de búsqueda
  searchTerm: string = '';

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('🔍 Cargando pacientes del usuario autenticado...');
    
    this.patientService.getMyPatients().subscribe({
      next: (data) => {
        console.log('✅ Pacientes cargados:', data);
        console.log('📊 Total de pacientes:', data.length);
        this.patients = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error cargando pacientes:', error);
        this.errorMessage = 'Error al cargar los pacientes';
        this.isLoading = false;
      }
    });
  }

  // Lista filtrada por cédula, nombre (insensible a mayúsculas)
  get filteredPatients(): Patient[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.patients;
    return this.patients.filter((p) => {
      const id = (p.documentNumber || '').toString().toLowerCase();
      const name = (p.fullName || '').toLowerCase();
      return id.includes(term) || name.includes(term);
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

  debugAllPatients(): void {
    this.patientService.debugAllPatients().subscribe({
      next: (response) => {
        console.log('🔍 Debug todos los pacientes:', response);
        alert(response);
      },
      error: (error) => {
        console.error('❌ Error en debug:', error);
        alert('Error en debug: ' + error.message);
      }
    });
  }
}
