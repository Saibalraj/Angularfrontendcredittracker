import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  // Step management
  currentStep: number = 1;

  // Form data
  email: string = '';
  otpArray: string[] = new Array(6).fill('');
  newPassword: string = '';
  confirmPassword: string = '';

  // State management
  isLoading: boolean = false;
  emailError: string = '';
  otpError: string = '';
  errorMessage: string = '';
  passwordMismatch: boolean = false;

  // OTP management
  attemptsRemaining: number = 3;
  countdown: number = 60;
  canResendOTP: boolean = false;
  private countdownInterval: any;
  private generatedOTP: string = '';

  constructor(private router: Router) {}

  // Navigation
  goBack() {
    this.router.navigate(['/login']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  // Step 1: Send OTP
  sendOTP() {
    if (!this.email) return;

    this.isLoading = true;
    this.emailError = '';

    // Simulate API call to send OTP
    setTimeout(() => {
      this.isLoading = false;

      // Generate random 6-digit OTP
      this.generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('Generated OTP:', this.generatedOTP); // For testing purposes

      // Move to OTP verification step
      this.currentStep = 2;
      this.startOTPCountdown();

      // Show success message (in real app, this would be sent via email)
      this.showTemporaryMessage('Verification code sent to your email!', 'success');
    }, 2000);
  }

  // Step 2: OTP Handling
  onOtpInput(event: any, index: number) {
    const input = event.target;
    const value = input.value;

    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      this.otpArray[index] = '';
      return;
    }

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementsByName('otp' + (index + 1))[0] as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }

    this.otpError = '';
  }

  onOtpKeyDown(event: KeyboardEvent, index: number) {
    // Handle backspace
    if (event.key === 'Backspace' && !this.otpArray[index] && index > 0) {
      const prevInput = document.getElementsByName('otp' + (index - 1))[0] as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text');
    if (pasteData && /^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split('');
      digits.forEach((digit, index) => {
        if (index < 6) {
          this.otpArray[index] = digit;
        }
      });

      // Focus last input
      const lastInput = document.getElementsByName('otp5')[0] as HTMLInputElement;
      if (lastInput) lastInput.focus();
    }
  }

  isOtpComplete(): boolean {
    return this.otpArray.every(digit => digit !== '');
  }

  verifyOTP() {
    if (!this.isOtpComplete()) return;

    this.isLoading = true;
    this.otpError = '';

    const enteredOTP = this.otpArray.join('');

    // Simulate API verification
    setTimeout(() => {
      this.isLoading = false;

      if (enteredOTP === this.generatedOTP) {
        // OTP verified successfully
        this.currentStep = 3;
        this.attemptsRemaining = 3; // Reset attempts for next time
      } else {
        // Invalid OTP
        this.attemptsRemaining--;
        this.otpError = 'Invalid verification code';

        if (this.attemptsRemaining <= 0) {
          this.errorMessage = 'Too many failed attempts. Please request a new code.';
          this.currentStep = 1;
          this.resetOTPState();
        }
      }
    }, 1500);
  }

  resendOTP() {
    if (!this.canResendOTP) return;

    this.resetOTPState();
    this.sendOTP();
  }

  startOTPCountdown() {
    this.canResendOTP = false;
    this.countdown = 60;

    this.countdownInterval = setInterval(() => {
      this.countdown--;

      if (this.countdown <= 0) {
        this.canResendOTP = true;
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  resetOTPState() {
    this.otpArray = new Array(6).fill('');
    this.otpError = '';
    this.attemptsRemaining = 3;

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  // Step 3: Password Reset
  resetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    this.isLoading = true;

    // Simulate API call to reset password
    setTimeout(() => {
      this.isLoading = false;
      this.currentStep = 4; // Success step

      // In real app, you would call your backend API here
      console.log('Password reset successful for:', this.email);
    }, 2000);
  }

  // Password strength calculation
  getPasswordStrengthClass(): string {
    if (!this.newPassword) return '';

    const strength = this.calculatePasswordStrength(this.newPassword);
    if (strength < 3) return 'strength-weak';
    if (strength < 5) return 'strength-medium';
    return 'strength-strong';
  }

  getPasswordStrengthText(): string {
    if (!this.newPassword) return '';

    const strength = this.calculatePasswordStrength(this.newPassword);
    if (strength < 3) return 'Weak';
    if (strength < 5) return 'Medium';
    return 'Strong';
  }

  calculatePasswordStrength(password: string): number {
    let strength = 0;

    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    return strength;
  }

  // Utility methods
  clearError() {
    this.errorMessage = '';
  }

  showTemporaryMessage(message: string, type: 'success' | 'error' = 'success') {
    this.errorMessage = message;
    setTimeout(() => {
      if (this.errorMessage === message) {
        this.errorMessage = '';
      }
    }, 3000);
  }

  // Watch for password mismatch
  ngOnChanges() {
    this.passwordMismatch = this.newPassword !== this.confirmPassword &&
                           this.confirmPassword.length > 0;
  }

  // Cleanup
  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
