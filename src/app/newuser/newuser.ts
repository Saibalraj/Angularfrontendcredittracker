import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, Student } from '../services/auth.service';

@Component({
  selector: 'app-newuser',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './newuser.html',
  styleUrls: ['./newuser.css']
})
export class NewuserComponent {
  student: Student = {
    rollNo: 0,
    name: '',
    program: '',
    requiredCredits: 0,
    password: ''
  };

  confirmPassword: string = '';
  termsAccepted: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' | '' = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  passwordsMatch(): boolean {
    return this.student.password === this.confirmPassword;
  }

  onSubmit(form: NgForm) {
    Object.keys(form.controls).forEach(key => form.controls[key].markAsTouched());

    if (form.valid && this.termsAccepted) {
      if (!this.passwordsMatch()) {
        this.showMessage('Passwords do not match!', 'error');
        return;
      }

      if ((this.student.password?.length ?? 0) < 6) {
  this.showMessage('Password must be at least 6 characters long!', 'error');
  return;
}

      this.isLoading = true;

      this.authService.register(this.student).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Registration successful:', response);

          localStorage.setItem('registrationSuccess', 'true');
          localStorage.setItem('registeredName', this.student.name);

          this.showMessage('Registration successful! Redirecting to login...', 'success');

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error.error?.message || 'Registration failed! Please try again.';
          this.showMessage(errorMessage, 'error');
        }
      });
    } else {
      this.showMessage('Please fill in all required fields correctly and accept the terms!', 'error');
    }
  }

  showMessage(text: string, type: 'success' | 'error') {
    this.message = text;
    this.messageType = type;

    setTimeout(() => {
      if (this.message === text) {
        this.message = '';
        this.messageType = '';
      }
    }, 5000);
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const pattern = /^[0-9]*$/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) event.preventDefault();
  }

  resetForm(form?: NgForm) {
    this.student = {
      rollNo: 0,
      name: '',
      program: '',
      requiredCredits: 0,
      password: ''
    };
    this.confirmPassword = '';
    this.termsAccepted = false;
    this.message = '';
    this.messageType = '';
    form?.resetForm();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
  
}
