import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import {
  LucideAngularModule,
  FileText,
  Users,
  FileCheck,
  Clipboard,
  BookOpen,
} from 'lucide-angular';

@Component({
  selector: 'app-registry-welcome',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    LucideAngularModule,
    NgOptimizedImage,
  ],
  templateUrl: './registry-welcome.html',
  styleUrls: ['./registry-welcome.css'],
})
export class RegistryWelcome {
  readonly FileText = FileText;
  readonly Users = Users;
  readonly FileCheck = FileCheck;
  readonly Clipboard = Clipboard;
  readonly BookOpen = BookOpen;
  registroId = 1;
}
