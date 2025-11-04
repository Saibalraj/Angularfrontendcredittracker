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
    username: '',
    program: '',
    requiredCredits: 0,
    password: '',
    rollNo: 0,
    name: ''
  };

  confirmPassword = '';
  termsAccepted = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';
  isLoading = false;

  constructor(private router: Router, private authService: AuthService) {}

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

   if ((this.student.password?.length || 0) < 6) {
  this.showMessage('Password must be at least 6 characters long!', 'error');
  return;
}

      this.isLoading = true;

      this.authService.register(this.student).subscribe({
        next: () => {
          this.isLoading = false;
          localStorage.setItem('registrationSuccess', 'true');
          localStorage.setItem('registeredUsername', this.student.username);
          this.showMessage('Registration successful! Redirecting...', 'success');
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (error) => {
          this.isLoading = false;
          const errorMsg = error.error?.message || 'Registration failed! Please try again.';
          this.showMessage(errorMsg, 'error');
        }
      });
    } else {
      this.showMessage('Please fill all fields and accept the terms!', 'error');
    }
  }

  showMessage(msg: string, type: 'success' | 'error') {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      if (this.message === msg) {
        this.message = '';
        this.messageType = '';
      }
    }, 5000);
  }

 resetForm(form?: NgForm) {
  this.student = {
    username: '',
    program: '',
    requiredCredits: 0,
    password: '',
    rollNo: 0,
    name: ''
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
