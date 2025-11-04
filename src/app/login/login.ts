import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, LoginRequest } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginData: LoginRequest = {
    username: '',
    password: '',
    rollNo: 0
  };

  message = '';
  messageType: 'success' | 'error' | '' = '';
  showMessage = false;
  isLoading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const registrationSuccess = localStorage.getItem('registrationSuccess');
    const registeredUsername = localStorage.getItem('registeredUsername');

    if (registrationSuccess === 'true') {
      this.showMessage = true;
      this.message = 'Registration completed successfully! Please login.';
      this.messageType = 'success';

      if (registeredUsername) {
        this.loginData.username = registeredUsername;
      }

      localStorage.removeItem('registrationSuccess');
      localStorage.removeItem('registeredUsername');
      setTimeout(() => this.closeMessage(), 10000);
    }

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  login() {
    if (this.isLoading) return;

    if (!this.loginData.username || !this.loginData.password) {
      this.showError('Please enter both username and password.');
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginData).subscribe({
      next: (student) => {
        this.isLoading = false;
        localStorage.setItem('student', JSON.stringify(student));
        this.showSuccess('Login successful! Redirecting...');
        setTimeout(() => this.router.navigate(['/dashboard']), 1000);
      },
      error: (error) => {
        this.isLoading = false;
        const msg = error.error?.message || 'Invalid username or password!';
        this.showError(msg);
      }
    });
  }

  goToSignup() {
    this.router.navigate(['/signup']);
  }

  forgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  closeMessage() {
    this.showMessage = false;
    this.message = '';
    this.messageType = '';
  }

  private showError(msg: string) {
    this.message = msg;
    this.messageType = 'error';
    this.showMessage = true;
    setTimeout(() => this.closeMessage(), 5000);
  }

  private showSuccess(msg: string) {
    this.message = msg;
    this.messageType = 'success';
    this.showMessage = true;
  }
}
