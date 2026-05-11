import { AfterViewInit, Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

declare const lucide: any

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterModule,
    LucideAngularModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})

export class SidebarComponent implements AfterViewInit {
  private router = inject(Router);

  ngAfterViewInit(): void {
    lucide.createIcons();
  }

}