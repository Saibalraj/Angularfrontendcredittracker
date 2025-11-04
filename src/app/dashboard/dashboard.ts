import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, SubjectApplication } from '../services/admin.service';
import { Course, Subject as CourseSubject } from '../models/course.model';
import { ToastService } from '../shared/toast.service';
import { ToastComponent } from '../shared/toast.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  studentName = 'Student';
  studentProfile: any = {};
  adminCourses: Course[] = [];
  selectedAdminCourseId: string = '';
  selectedAdminSemesterId: number = 1;
  showPassword: boolean = false;

  private pollHandle: any = null;
  private notifiedAppIds = new Set<string>();

  constructor(private router: Router, private adminService: AdminService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadUserFromStorage();
    this.adminCourses = this.adminService.getCourses() || [];
    // if student has program, select matching course
    if (this.studentProfile.program) {
      const normalized = String(this.studentProfile.program || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
      const found = this.adminCourses.find(c => String(c.name || '').replace(/[^a-z0-9]/gi, '').toLowerCase() === normalized);
      if (found) this.selectedAdminCourseId = found.id;
    }
    if (!this.selectedAdminCourseId && this.adminCourses.length) this.selectedAdminCourseId = this.adminCourses[0].id;

    // start polling applications to detect approvals
    this.pollHandle = setInterval(() => this.checkApplications(), 3000);
  }

  ngOnDestroy(): void {
    if (this.pollHandle) clearInterval(this.pollHandle);
  }

  private loadUserFromStorage() {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return;
      const u = JSON.parse(raw);
      this.studentProfile = u || {};
      this.studentName = u?.name || u?.username || 'Student';
    } catch (e) { console.warn(e); }
  }

  getAdminCourseSubjects(courseId: string, semesterId: number): CourseSubject[] {
    const c = this.adminCourses.find(x => x.id === courseId);
    if (!c) return [];
    const sem = c.semesters.find(s => s.id === Number(semesterId));
    return sem ? (sem.subjects as CourseSubject[]) : [];
  }

  applyForSubject(subject: CourseSubject) {
    try {
      const raw = localStorage.getItem('currentUser');
      const user = raw ? JSON.parse(raw) : {};
      const studentRoll = user?.rollNo ?? user?.id ?? user?.username ?? 'unknown';
      const studentName = user?.name ?? user?.username ?? '';

      // Check if student already has a pending or approved application for this subject
      const existingApps = this.adminService.getApplications() || [];
      const hasExisting = existingApps.some(a =>
        a.studentRoll === studentRoll &&
        a.courseId === this.selectedAdminCourseId &&
        a.semesterId === Number(this.selectedAdminSemesterId) &&
        a.subject?.name === subject.name &&
        (a.status === 'pending' || a.status === 'approved')
      );

      if (hasExisting) {
        this.toast.show('You already have a pending or approved application for this subject', 'error');
        return;
      }

      const app: SubjectApplication = {
        id: `app-${Date.now()}`,
        studentRoll,
        studentName,
        courseId: this.selectedAdminCourseId,
        semesterId: Number(this.selectedAdminSemesterId),
        subject: { id: subject.id as any, name: subject.name, credits: (subject as any).credits || 0 },
        status: 'pending'
      };
      this.adminService.applySubject(app);
      this.toast.show('Application submitted', 'success');
    } catch (e) { console.error(e); this.toast.show('Failed to apply', 'error'); }
  }

  getApplicationStatus(subject: CourseSubject): string | null {
    const raw = localStorage.getItem('currentUser');
    const user = raw ? JSON.parse(raw) : {};
    const studentRoll = user?.rollNo ?? user?.id ?? user?.username ?? null;
    if (!studentRoll) return null;
    const apps = this.adminService.getApplications() || [];
    const found = apps.find((a: any) => a.studentRoll == studentRoll && a.courseId === this.selectedAdminCourseId && a.semesterId === Number(this.selectedAdminSemesterId) && a.subject?.name === subject.name);
    return found ? found.status : null;
  }

  private checkApplications() {
    const raw = localStorage.getItem('currentUser');
    const user = raw ? JSON.parse(raw) : {};
    const studentRoll = user?.rollNo ?? user?.id ?? user?.username ?? null;
    if (!studentRoll) return;
    const apps = this.adminService.getApplications() || [];
    apps.forEach(a => {
      if (a.studentRoll == studentRoll && a.status === 'approved' && !this.notifiedAppIds.has(a.id)) {
        this.notifiedAppIds.add(a.id);
        this.toast.show('Your subject has been approved by admin', 'success');
      }
      if (a.studentRoll == studentRoll && a.status === 'rejected' && !this.notifiedAppIds.has(a.id)) {
        this.notifiedAppIds.add(a.id);
        this.toast.show('Your subject application was rejected', 'info');
      }
    });
  }

  logout() {
    try {
      localStorage.removeItem('currentUser');
    } catch (e) { /* ignore */ }
    this.toast.show('Logged out', 'info');
    this.router.navigate(['/login']).catch(() => {});
  }

  refreshData() {
    // Reload courses
    this.adminCourses = this.adminService.getCourses() || [];

    // Clear notifications cache to show new notifications
    this.notifiedAppIds.clear();

    // Force check for new applications
    this.checkApplications();

    // Reload user profile
    this.loadUserFromStorage();

    this.toast.show('Dashboard refreshed', 'success');
  }

  exportMyApplications() {
    const raw = localStorage.getItem('currentUser');
    const user = raw ? JSON.parse(raw) : {};
    const studentRoll = user?.rollNo ?? user?.id ?? user?.username ?? null;
    if (!studentRoll) return;

    const apps = (this.adminService.getApplications() || [])
      .filter(a => a.studentRoll == studentRoll)
      .map(a => ({
        subject: a.subject?.name || '',
        credits: a.subject?.credits || 0,
        course: this.adminCourses.find(c => c.id === a.courseId)?.name || a.courseId,
        semester: a.semesterId,
        status: a.status,
        appliedAt: a.id.split('-')[1] // timestamp part of the ID
      }));

    if (apps.length === 0) {
      this.toast.show('No applications to export', 'info');
      return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(apps);
    XLSX.utils.book_append_sheet(wb, ws, 'My Applications');
    XLSX.writeFile(wb, `my-applications-${Date.now()}.xlsx`);
    this.toast.show('Excel file exported', 'success');
  }

  getSemesterCredits(courseId: string, semesterId: number): number {
    const raw = localStorage.getItem('currentUser');
    const user = raw ? JSON.parse(raw) : {};
    const studentRoll = user?.rollNo ?? user?.id ?? user?.username ?? null;
    if (!studentRoll) return 0;

    const apps = this.adminService.getApplications() || [];
    const semesterApps = apps.filter(a =>
      a.studentRoll === studentRoll &&
      a.courseId === courseId &&
      a.semesterId === Number(semesterId) &&
      a.status === 'approved'
    );

    return semesterApps.reduce((sum, app) => sum + (app.subject?.credits || 0), 0);
  }

  getMyApprovedApplications(courseId?: string, semesterId?: number): SubjectApplication[] {
    const raw = localStorage.getItem('currentUser');
    const user = raw ? JSON.parse(raw) : {};
    const studentRoll = user?.rollNo ?? user?.id ?? user?.username ?? null;
    if (!studentRoll) return [];

    return (this.adminService.getApplications() || []).filter(a =>
      a.studentRoll == studentRoll &&
      a.status === 'approved' &&
      (!courseId || a.courseId === courseId) &&
      (!semesterId || a.semesterId === semesterId)
    );
  }

  isSemesterFull(courseId: string, semesterId: number): boolean {
    return this.getSemesterCredits(courseId, semesterId) >= 36;
  }

  getTotalCredits(): number {
    return this.getMyApprovedApplications().reduce((sum, app) => sum + (app.subject?.credits || 0), 0);
  }

  isCourseFull(): boolean {
    return this.getTotalCredits() >= 216;
  }
}
