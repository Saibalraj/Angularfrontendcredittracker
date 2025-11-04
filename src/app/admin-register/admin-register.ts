import { Component } from '@angular/core';
import { EyeToggleComponent } from '../shared/eye-toggle.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-admin-register',
  standalone: true,
  imports: [CommonModule, FormsModule, EyeToggleComponent],
  templateUrl: './admin-register.html',
  styleUrls: ['./admin-register.css']
})
export class AdminRegisterComponent {
  username = '';
  password = '';
  message = '';
  showPassword = false;

  constructor(private admin: AdminService, private router: Router) {}

  register() {
    // basic validation: username must be alphabetic
    const name = (this.username || '').trim();
    if (!name || !/^[A-Za-z]+$/.test(name)) {
      this.message = 'Username must contain letters only (no numbers)';
      return;
    }
    if (!this.password) {
      this.message = 'Please provide a password';
      return;
    }
    this.admin.addAdmin(this.username, this.password);
    this.message = 'Admin registered. You can now login.';
    setTimeout(() => this.router.navigate(['/admin-login']), 1000);
  }

  togglePasswordVisibility() { this.showPassword = !this.showPassword; }
}
