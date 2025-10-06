import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TabsComponent } from '../tabs/tabs.component';
import { NgbTooltipModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../services/patient.service';
import { ResultService } from '../../services/result.service';
import { Patient } from '../../models/Patient';
import { Result } from '../../models/Result';
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

  // Para el modal de historial
  selectedPatient: Patient | null = null;
  patientResults: Result[] = [];
  isLoadingResults = false;

  // Para el modal de edición
  editingPatient: Patient | null = null;
  isEditing = false;

  constructor(
    private patientService: PatientService,
    private resultService: ResultService,
    private modal: NgbModal
  ) {}

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
      },
      error: (error) => {
        console.error('❌ Error en debug:', error);
      }
    });
  }

  // Método para abrir el modal de historial
  openHistoryModal(patient: Patient, modalTemplate: any): void {
    this.selectedPatient = patient;
    this.patientResults = [];
    this.isLoadingResults = true;
    
    this.modal.open(modalTemplate, { 
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });

    // Cargar las evaluaciones del paciente
    this.loadPatientResults(patient.id!);
  }

  // Método para cargar las evaluaciones del paciente
  loadPatientResults(patientId: number): void {
    this.isLoadingResults = true;
    this.resultService.getByPatientId(patientId).subscribe({
      next: (results) => {
        this.patientResults = results;
        this.isLoadingResults = false;
        console.log(`📊 Cargadas ${results.length} evaluaciones para el paciente ${this.selectedPatient?.fullName}`);
      },
      error: (error) => {
        console.error('Error cargando evaluaciones del paciente:', error);
        this.patientResults = [];
        this.isLoadingResults = false;
      }
    });
  }

  // Método para cerrar el modal
  closeModal(): void {
    this.modal.dismissAll();
    this.selectedPatient = null;
    this.patientResults = [];
  }

  // Método para exportar pacientes a Excel
  exportToExcel(): void {
    this.patientService.exportToExcel().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pacientes_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        console.log('✅ Archivo Excel descargado exitosamente');
      },
      error: (error: any) => {
        console.error('❌ Error exportando a Excel:', error);
      }
    });
  }

  // Método para abrir el modal de edición
  openEditModal(patient: Patient, modalTemplate: any): void {
    this.editingPatient = { ...patient }; // Crear una copia para editar
    this.isEditing = true;
    this.modal.open(modalTemplate, {
      size: 'md',
      centered: true,
      backdrop: 'static'
    });
  }

  // Método para guardar los cambios del paciente
  savePatientChanges(): void {
    if (this.editingPatient) {
      this.patientService.update(this.editingPatient.id!, this.editingPatient).subscribe({
        next: () => {
          console.log('✅ Paciente actualizado exitosamente');
          this.loadPatients(); // Recargar la lista
          this.closeEditModal();
        },
        error: (error: any) => {
          console.error('❌ Error actualizando paciente:', error);
        }
      });
    }
  }

  // Método para cerrar el modal de edición
  closeEditModal(): void {
    this.modal.dismissAll();
    this.editingPatient = null;
    this.isEditing = false;
  }

  // Método para exportar historial de evaluaciones del paciente a Excel
  exportPatientHistoryToExcel(): void {
    if (this.patientResults && this.patientResults.length > 0 && this.selectedPatient?.id) {
      this.resultService.exportPatientHistoryToExcel(this.selectedPatient.id).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const patientName = this.selectedPatient?.fullName?.replace(/\s+/g, '_') || 'paciente';
          link.download = `historial_${patientName}_${new Date().toISOString().split('T')[0]}.xlsx`;
          link.click();
          window.URL.revokeObjectURL(url);
          console.log('✅ Historial de evaluaciones exportado exitosamente');
        },
        error: (error: any) => {
          console.error('❌ Error exportando historial:', error);
          alert('Error al exportar el historial de evaluaciones');
        }
      });
    } else {
      alert('No hay evaluaciones para exportar');
    }
  }
}
