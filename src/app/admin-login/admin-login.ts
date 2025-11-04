import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { EyeToggleComponent } from '../shared/eye-toggle.component';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EyeToggleComponent],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.css']
})
export class AdminLoginComponent {
  // navigate to admin registration page (if present)
  goToSignup(): void {
    this.router.navigate(['/admin-register']);
  }
  username = '';
  password = '';
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';
  showPassword = false;

  constructor(private router: Router, private adminService: AdminService) {}

  login() {
    if (this.isLoading) return;
    if (!this.username || !this.password) {
      this.showError('Please enter admin username and password');
      return;
    }
    this.isLoading = true;

    // Simulate backend call
    setTimeout(() => {
      this.isLoading = false;
      // validate using AdminService
      const found = this.adminService.validateAdmin(this.username, this.password);
      if (found) {
        const admin = { username: this.username, role: 'admin' };
        localStorage.setItem('currentAdmin', JSON.stringify(admin));
        this.showSuccess('Admin login successful');
        this.router.navigate(['/admin-dashboard']);
      } else {
        this.showError('Invalid admin credentials');
      }
    }, 600);
  }

   togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private showError(msg: string) {
    this.messageType = 'error';
    this.message = msg;
    setTimeout(() => { this.message = ''; this.messageType = ''; }, 4000);
  }

  private showSuccess(msg: string) {
    this.messageType = 'success';
    this.message = msg;
    setTimeout(() => { this.message = ''; this.messageType = ''; }, 3000);
  }
}
