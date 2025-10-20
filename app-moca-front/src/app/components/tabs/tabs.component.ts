import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgbCollapseModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-tabs',
  imports: [RouterLink,CommonModule,NgbCollapseModule,NgbTooltipModule],
  standalone:true,
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css'
})
export class TabsComponent {

  isCollapsed = true;

  constructor(private router: Router) {}

  logout(): void {
    // Limpiar datos de sesión si es necesario
    localStorage.clear();
    sessionStorage.clear();
    
    // Navegar al login principal
    this.router.navigate(['/login']);
  }
}
