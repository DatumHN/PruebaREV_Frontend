import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// --- Servicios y Entidades ---
import { Api, RequestList } from '../../services/api/api';

// --- Lucide ---
import { LucideAngularModule, ChevronUp, Inbox } from 'lucide-angular';

@Component({
  selector: 'app-approve-table',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, LucideAngularModule],
  templateUrl: './approve-table.html',
  styleUrl: './approve-table.css',
})
export class ApproveTable implements OnInit {
  private api = inject(Api);
  private router = inject(Router);

  solicitudes: RequestList[] = [];
  filteredSolicitudes: RequestList[] = [];
  paginatedSolicitudes: RequestList[] = [];
  tipoDocumentoIds: number[] = [];
  isLoading = true;

  // Sorting
  sortField: keyof RequestList | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  // Lucide icons
  readonly ChevronUp = ChevronUp;
  readonly Inbox = Inbox;

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
            solicitud.estado === 'Pendiente' ||
            solicitud.estado === 'Rechazado',
        );
        this.filteredSolicitudes = [...this.solicitudes];
        this.updatePagination();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching request list', err);
        this.isLoading = false;
      },
    });
  }

  navigateToApprove(id: number, idtipodoc: number): void {
    // Navegamos a la ruta de aprobación dentro del microfrontend de registro
    this.router.navigate([`/inicio/registry/approve/${id}/${idtipodoc}`]);
  }

  // Helper para obtener la clase del badge según el estado
  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'Pendiente':
        return 'tw-badge-warning';
      case 'Rechazado':
        return 'tw-badge-danger';
      case 'Aprobado':
        return 'tw-badge-success';
      default:
        return 'tw-badge-info';
    }
  }

  // Sorting functionality
  sort(field: keyof RequestList): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applySortAndFilter();
  }

  private applySortAndFilter(): void {
    // Apply sorting
    if (this.sortField) {
      this.filteredSolicitudes.sort((a, b) => {
        const aVal = a[this.sortField as keyof typeof a];
        const bVal = b[this.sortField as keyof typeof b];

        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return -1;
        if (bVal == null) return 1;

        let comparison = 0;
        if (aVal < bVal) {
          comparison = -1;
        } else if (aVal > bVal) {
          comparison = 1;
        }

        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    this.currentPage = 1; // Reset to first page after sorting
    this.updatePagination();
  }

  // Pagination functionality
  updatePagination(): void {
    this.totalPages = Math.ceil(
      this.filteredSolicitudes.length / this.pageSize,
    );
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(
      startIndex + this.pageSize,
      this.filteredSolicitudes.length,
    );
    this.paginatedSolicitudes = this.filteredSolicitudes.slice(
      startIndex,
      endIndex,
    );

    // Extraer tipoDocumento.id para el backend
    this.tipoDocumentoIds = this.paginatedSolicitudes.map(
      (solicitud) => solicitud.tipoDocumento.id,
    );
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  getTotalPages(): number {
    return this.totalPages;
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  getEndIndex(): number {
    return Math.min(
      this.getStartIndex() + this.pageSize,
      this.filteredSolicitudes.length,
    );
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }
}
