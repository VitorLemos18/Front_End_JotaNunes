import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Output() logout = new EventEmitter<void>();

  constructor(private router: Router) {}

  onLogout() {
    this.logout.emit();
    this.router.navigate(['/login']);
  }
}