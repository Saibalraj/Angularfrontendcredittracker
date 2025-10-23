import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';

  message: string = '';
  messageType: 'success' | 'error' | '' = '';
  showMessage: boolean = false;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const registrationSuccess = localStorage.getItem('registrationSuccess');
    const registeredName = localStorage.getItem('registeredName');

    if (registrationSuccess === 'true') {
      this.showMessage = true;
      this.message = 'Registration successful! Please login with your credentials.';
      this.messageType = 'success';

      if (registeredName) {
        this.username = registeredName;
      }

      localStorage.removeItem('registrationSuccess');
      localStorage.removeItem('registeredName');

      setTimeout(() => this.closeMessage(), 10000);
    }

    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.showMessage = true;
        this.message = params['message'] || 'Registration successful! Please login.';
        this.messageType = 'success';
      }
    });

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  login() {
    if (this.isLoading) return;

    if (!this.username || !this.password) {
      this.showError('Please enter both username and password.');
      return;
    }

    if (this.username.trim().length === 0) {
      this.showError('Please enter a valid username.');
      return;
    }

    this.isLoading = true;

    const loginData = {
      name: this.username,
      password: this.password
    };
  this.authService.login(loginData).subscribe({
      next: (student) => {
        this.isLoading = false;
        this.showSuccess('Login successful! Redirecting...');
        setTimeout(() => this.router.navigate(['/dashboard']), 1000);
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Invalid username or password!';
        this.showError(errorMessage);
      }
    });
  }

  goToSignup() {
    this.router.navigate(['/register']);
  }

  forgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  closeMessage() {
    this.showMessage = false;
    this.message = '';
    this.messageType = '';
  }

  private showError(errorMessage: string) {
    this.message = errorMessage;
    this.messageType = 'error';
    this.showMessage = true;
    setTimeout(() => this.closeMessage(), 5000);
  }

  private showSuccess(successMessage: string) {
    this.message = successMessage;
    this.messageType = 'success';
    this.showMessage = true;
  }
}
