import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TabsComponent } from '../tabs/tabs.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { UserEntityService } from '../../services/user-entity.service';
import { UserEntity } from '../../models/UserEntity';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-patient-control',
  imports: [TabsComponent, NgbTooltipModule, CommonModule, NgxPaginationModule, FormsModule],
  standalone: true,
  templateUrl: './patient-control.component.html',
  styleUrl: './patient-control.component.css'
})
export class PatientControlComponent implements OnInit {
  patients: UserEntity[] = [];
  isLoading = false;
  errorMessage = '';

  itemsPerPage: number = 5;
  p: number = 1;

  // Texto de búsqueda
  searchTerm: string = '';

  constructor(private userEntityService: UserEntityService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userEntityService.getAll().subscribe({
      next: (data) => {
        this.patients = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando pacientes:', error);
        this.errorMessage = 'Error al cargar los pacientes';
        this.isLoading = false;
      }
    });
  }

  // Lista filtrada por cédula, nombre o correo (insensible a mayúsculas)
  get filteredPatients(): UserEntity[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.patients;
    return this.patients.filter((p) => {
      const id = (p.idNumber || '').toString().toLowerCase();
      const name = (p.fullName || '').toLowerCase();
      const email = (p.email || '').toLowerCase();
      return id.includes(term) || name.includes(term) || email.includes(term);
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
}
