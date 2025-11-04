import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Fixed import path

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService, // Remove type annotation if interface
    private router: Router
  ) {}

  canActivate(route: any): boolean {
    const requiresAdmin = route.data?.requiresAdmin;
    const requiresStudent = route.data?.requiresStudent;

    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check if route requires admin access
    if (requiresAdmin) {
      const currentAdmin = localStorage.getItem('currentAdmin');
      if (!currentAdmin) {
        this.router.navigate(['/admin-login']);
        return false;
      }
      return true;
    }

    // Check if route requires student access
    if (requiresStudent) {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        this.router.navigate(['/login']);
        return false;
      }
      return true;
    }

    return true;
  }
}
