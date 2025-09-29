import { Component, OnInit } from '@angular/core';
import { TabsComponent } from '../tabs/tabs.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { UserEntityService } from '../../services/user-entity.service';
import { UserEntity } from '../../models/UserEntity';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-patient-control',
  imports: [TabsComponent, NgbTooltipModule, CommonModule, NgxPaginationModule],
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
}
