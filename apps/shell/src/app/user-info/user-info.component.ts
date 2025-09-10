import { Component, OnInit } from '@angular/core';
import { ClockComponent } from '../clock/clock.component';
import { LucideAngularModule, Settings } from 'lucide-angular';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss'],
  standalone: true,
  imports: [ClockComponent, LucideAngularModule],
})
export class UserInfoComponent implements OnInit {
  mes = 'Enero';
  dia = 1;
  anio = 2000;

  ngOnInit(): void {
    const currentDate = new Date();
    this.mes = currentDate.toLocaleString('es-ES', { month: 'long' });
    this.dia = currentDate.getDate();
    this.anio = currentDate.getFullYear();
  }

  openSettings() {
    // TODO: Implement settings dialog
  }

  protected readonly Settings = Settings;
}
