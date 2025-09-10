import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

// --- PrimeNG ---
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';


// --- Servicios y Entidades ---
import { Api, RequestList } from '../../services/api/api';

// --- Lucide ---
import { LucideAngularModule, CircleCheckBig } from 'lucide-angular';


@Component({
  selector: 'approve-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    CardModule,
    TooltipModule,
    ProgressSpinnerModule,
    DatePipe,
    LucideAngularModule
  ],
  templateUrl: './approve-table.html',
  styleUrl: './approve-table.css',
})
export class ApproveTable implements OnInit {
  private api = inject(Api);
  private router = inject(Router);

  solicitudes: RequestList[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading = true;
    this.api.getRequestList().subscribe({
      next: (data) => {
        // Filtramos para obtener solo las solicitudes pendientes o rechazadas
        this.solicitudes = data.filter(
          (solicitud) =>
            solicitud.estado === 'Pendiente' || solicitud.estado === 'Rechazado'
        );
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching request list', err);
        this.isLoading = false;
      },
    });
  }

  navigateToApprove(id: string): void {
    // Navegamos a la ruta de aprobación dentro del microfrontend de registro
    this.router.navigate([`/inicio/registry/approve/${id}`]);
  }

  // Helper para obtener el color del tag según el estado
  getSeverity(estado: string): 'warning' | 'danger' | 'success' | 'info' {
    switch (estado) {
      case 'Pendiente':
        return 'warning';
      case 'Rechazado':
        return 'danger';
      case 'Aprobado':
        return 'success';
      default:
        return 'info';
    }
  }
}
