import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { NewuserComponent } from './newuser/newuser';
import { DashboardComponent } from './dashboard/dashboard';
import { ProfileComponent } from './profile/profile';
import { SettingsComponent } from './settings/settings';
import { TranscriptComponent } from './transcript/transcript';
import { AttendanceComponent } from './attendance/attendance';
import { ContactComponent } from './contact/contact';
import { RequestComponent } from './request/request';
import { ForgotPasswordComponent } from './forgot-password/forgot-password';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', redirectTo: '/login' },
  { path: 'register', component: NewuserComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'transcript', component: TranscriptComponent },
  { path: 'attendance', component: AttendanceComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'request', component: RequestComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: '**', redirectTo: '/login' }
];
