import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { NewuserComponent } from './newuser/newuser';
import { DashboardComponent } from './dashboard/dashboard';
import { AdminLoginComponent } from './admin-login/admin-login';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { AdminRegisterComponent } from './admin-register/admin-register';
import { ForgotPasswordComponent } from './forgot-password/forgot-password';
import { AuthGuard } from './auth/auth.guard';
import { CoursesComponent } from './courses/courses';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'register', component: NewuserComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { requiresStudent: true }
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { requiresAdmin: true }
  },
  { path: 'admin-register', component: AdminRegisterComponent },
  { path: 'courses', component: CoursesComponent, canActivate: [AuthGuard], data: { requiresStudent: true } },
  { path: '**', redirectTo: '/login' }
];
