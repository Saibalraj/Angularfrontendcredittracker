import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminService, SubjectApplication } from '../services/admin.service';
import { Course, Subject } from '../models/course.model';
import { ToastService } from '../shared/toast.service';
import { ToastComponent } from '../shared/toast.component';
import { StudentDetailsModalComponent } from '../shared/student-details-modal.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastComponent, StudentDetailsModalComponent],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  courses: Course[] = [];
  selectedCourseId: string = '';
  selectedSemesterId: number = 1;
  selectedSubjectName: string = '';
  subjectOptions: Subject[] = [];

  // inputs for adding course
  newCourseId = '';
  newCourseName = '';

  // inputs for adding subject
  newSubjectName = '';
  newSubjectCredits = 6;

  applications: SubjectApplication[] = [];
  // selection for batch operations
  selectedAppIds: Set<string> = new Set<string>();
  importFile: File | null = null;
  selectedStudent: any = null;
  isModalOpen = false;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private authService: AuthService,
  public toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadApplications();
    this.loadRegisteredStudents();
    // listen for course changes (so subjects dropdown can update)
    try { window.addEventListener('coursesUpdated', () => { this.loadCourses(); this.loadSubjectOptions(); }); } catch (e) {}
    this.loadSubjectOptions();
    try { window.addEventListener('studentsUpdated', () => { this.loadRegisteredStudents(); this.loadApplications(); }); } catch (e) {}
  }

  logout(): void {
    try {
      this.authService.logout();
    } catch (e) {
      localStorage.removeItem('currentAdmin');
    }
    this.router.navigate(['/login']).catch(() => {});
  }

  loadCourses(): void {
    this.courses = this.adminService.getCourses() || [];
    if (this.courses.length > 0) {
      this.selectedCourseId = this.selectedCourseId || this.courses[0].id;
    }
  }

  refresh(): void {
    // keep things simple: reload subjects from storage (courses updated already)
    this.loadCourses();
    this.loadSubjectOptions();
  }

  loadSubjectOptions(): void {
    this.subjectOptions = this.getCurrentSubjects() || [];
    // reset selected subject if it's no longer present
    if (this.selectedSubjectName && !this.subjectOptions.some(s => s.name === this.selectedSubjectName)) {
      this.selectedSubjectName = '';
    }
  }

  addCourse(): void {
    if (!this.newCourseId || !this.newCourseName) {
      this.toast.show('Please enter both Course ID and Name', 'error');
      return;
    }

    if (this.courses.some(c => c.id === this.newCourseId)) {
      this.toast.show('Course ID already exists', 'error');
      return;
    }

    const course = this.adminService.buildCourse(this.newCourseId.toLowerCase(), this.newCourseName);
  this.courses.push(course);
  this.adminService.saveCoursesAndNotify(this.courses);
    this.selectedCourseId = course.id;
    this.newCourseId = '';
    this.newCourseName = '';
    this.refresh();
    this.toast.show('Course added successfully', 'success');
  }

  removeCourse(): void {
    if (!this.selectedCourseId) {
      this.toast.show('Please select a course first', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to remove course ${this.selectedCourseId}? This will remove all subjects and cannot be undone.`)) {
      return;
    }

    this.courses = this.courses.filter(c => c.id !== this.selectedCourseId);
    this.adminService.saveCoursesAndNotify(this.courses);
    this.selectedCourseId = this.courses.length > 0 ? this.courses[0].id : '';
    this.refresh();
    this.toast.show('Course removed successfully', 'info');
  }

  // Registered students (from registration form) - loaded from localStorage
  registeredStudents: any[] = [];

  loadRegisteredStudents(): void {
    try {
      const students = JSON.parse(localStorage.getItem('app_students_v1') || '[]');
      this.registeredStudents = Array.isArray(students) ? students : [];
    } catch (e) {
      this.registeredStudents = [];
    }
  }

  editPassword(studentRoll: string | number) {
    const roll = String(studentRoll || '');
    const newPwd = prompt(`Enter new password for student ${roll}`);
    if (newPwd === null) return; // cancelled
    try {
      const key = 'app_students_v1';
      const students = JSON.parse(localStorage.getItem(key) || '[]');
      let changed = false;
      for (let i = 0; i < students.length; i++) {
        if (String(students[i].rollNo) === roll) {
          students[i].password = newPwd;
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(key, JSON.stringify(students));
        this.toast.show('Password updated for student ' + roll, 'success');
        this.loadRegisteredStudents();
        this.loadApplications();
        try { window.dispatchEvent(new CustomEvent('studentsUpdated')); } catch (e) {}
      } else {
        this.toast.show('Student not found', 'error');
      }
    } catch (e) {
      console.error(e);
      this.toast.show('Failed to update password', 'error');
    }
  }

  // normalize program string like 'B.C.A' or 'BCA' to 'bca' to compare with course ids
  private normalizeProgram(s: string) {
    return String(s || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
  }

  getStudentsForSelectedCourse(): any[] {
    if (!this.selectedCourseId) return [];
    return (this.registeredStudents || []).filter(st => this.normalizeProgram(st.program) === this.selectedCourseId);
  }

  getCurrentSubjects(): Subject[] {
    if (!this.selectedCourseId) return [];
    const course = this.courses.find(c => c.id === this.selectedCourseId);
    if (!course) return [];
    const sem = course.semesters.find(s => s.id === Number(this.selectedSemesterId));
    return sem ? sem.subjects : [];
  }

  getSemesterCredits(courseId: string, semesterId: number): number {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return 0;
    const sem = course.semesters.find(s => s.id === Number(semesterId));
    if (!sem) return 0;
    return (sem.subjects || []).reduce((sum, sub) => sum + (Number((sub as any).credits) || 0), 0);
  }

  isSemesterFull(courseId: string, semesterId: number): boolean {
    return this.getSemesterCredits(courseId, semesterId) >= 36;
  }

  getCourseTotalCredits(courseId: string): number {
    const course = this.courses.find(c => c.id === courseId);
    if (!course) return 0;
    return (course.semesters || []).reduce((sumS, sem) => sumS + ((sem.subjects || []).reduce((s, sub) => s + (Number((sub as any).credits) || 0), 0)), 0);
  }

  isCourseFull(courseId: string): boolean {
    return this.getCourseTotalCredits(courseId) >= 216;
  }

  addSubject(): void {
    if (!this.selectedCourseId) return;
    const semesterId = Number(this.selectedSemesterId) || 1;
    const creditsToAdd = Number(this.newSubjectCredits || 6);
    const current = this.getSemesterCredits(this.selectedCourseId, semesterId) || 0;
    if (current + creditsToAdd > 36) {
      this.toast.show('Cannot add subject — semester credit limit (36) would be exceeded', 'error');
      return;
    }

    // Check number of subjects in semester
    const course = this.courses.find(c => c.id === this.selectedCourseId);
    const semester = course?.semesters.find(s => s.id === semesterId);
    if (semester && semester.subjects.length >= 6) {
      this.toast.show('Cannot add subject — semester already has maximum of 6 subjects', 'error');
      return;
    }

    const id = `${this.selectedCourseId}-s${semesterId}-sub-${Date.now()}`;
    const subject: Subject = { id, name: this.newSubjectName || 'New Subject', credits: creditsToAdd, semester: semesterId };
    this.adminService.addSubject(this.selectedCourseId, semesterId, subject);
    this.newSubjectName = '';
    this.newSubjectCredits = 6;
    this.refresh();
    this.toast.show('Subject added', 'success');
    // show credit completeness status
    if (this.isSemesterFull(this.selectedCourseId, semesterId)) {
      this.toast.show('Semester credits are now full (>=36)', 'success');
    } else {
      this.toast.show('Your credit is not full for this semester', 'info');
    }
  }

  removeSubject(subjectId: string): void {
    if (!this.selectedCourseId) return;
    const semesterId = Number(this.selectedSemesterId) || 1;
    if (!confirm('Remove this subject?')) return;
    this.adminService.removeSubject(this.selectedCourseId, semesterId, subjectId);
    this.refresh();
    this.toast.show('Subject removed', 'info');
    if (!this.isSemesterFull(this.selectedCourseId, semesterId)) {
      this.toast.show('Your credit is not full for this semester', 'info');
    }
  }

  loadApplications(): void {
    this.applications = this.adminService.getApplications() || [];
    // enrich with registered student details if available
    const students = this.registeredStudents || [];
    this.applications.forEach(a => {
      try {
        const found = students.find((s: any) => String(s.rollNo) === String(a.studentRoll) || String((s.name || '')).toLowerCase() === String((a.studentName || '')).toLowerCase());
        if (found) {
          a.studentName = a.studentName || found.name || found.username || '';
          (a as any).studentProgram = found.program || '';
          (a as any).studentPassword = found.password || '';
        }
      } catch (e) { /* ignore */ }
    });
  }

  // return applications filtered by selected course/semester/subject
  getFilteredApplications(): SubjectApplication[] {
    return (this.applications || []).filter(a => {
      if (this.selectedCourseId && a.courseId !== this.selectedCourseId) return false;
      if (this.selectedSemesterId && Number(a.semesterId) !== Number(this.selectedSemesterId)) return false;
      if (this.selectedSubjectName && a.subject && String(a.subject.name) !== String(this.selectedSubjectName)) return false;
      return true;
    });
  }

  approve(app: SubjectApplication): void {
    this.adminService.updateApplicationStatus(app.id, 'approved');
    this.loadApplications();
    this.toast.show(`Approved ${app.studentRoll}`, 'success');
  }

  reject(app: SubjectApplication): void {
    this.adminService.updateApplicationStatus(app.id, 'rejected');
    this.loadApplications();
    this.toast.show(`Rejected ${app.studentRoll}`, 'info');
  }

  toggleSelection(appId: string, checked: boolean) {
    if (checked) this.selectedAppIds.add(appId); else this.selectedAppIds.delete(appId);
  }

  selectAll(checked: boolean) {
    if (checked) {
      // only select the currently filtered rows
      this.getFilteredApplications().forEach(a => this.selectedAppIds.add(a.id));
    } else {
      // remove only those ids that are in the currently filtered rows
      const filtered = new Set(this.getFilteredApplications().map(a => a.id));
      Array.from(this.selectedAppIds).forEach(id => { if (filtered.has(id)) this.selectedAppIds.delete(id); });
    }
  }

  approveSelected() {
    if (this.selectedAppIds.size === 0) { this.toast.show('No applications selected', 'error'); return; }
    Array.from(this.selectedAppIds).forEach(id => this.adminService.updateApplicationStatus(id, 'approved'));
    this.loadApplications();
    this.selectedAppIds.clear();
    this.toast.show('Selected applications approved', 'success');
  }

  rejectSelected() {
    if (this.selectedAppIds.size === 0) { this.toast.show('No applications selected', 'error'); return; }
    Array.from(this.selectedAppIds).forEach(id => this.adminService.updateApplicationStatus(id, 'rejected'));
    this.loadApplications();
    this.selectedAppIds.clear();
    this.toast.show('Selected applications rejected', 'info');
  }

  exportApplicationsCsv() {
    const apps = this.adminService.getApplications();
    if (!apps || apps.length === 0) { this.toast.show('No applications to export', 'info'); return; }
    const rows = apps.map(a => ({
      id: a.id,
      studentRoll: a.studentRoll,
      studentName: a.studentName || '',
      courseId: a.courseId,
      semesterId: a.semesterId,
      subject: a.subject?.name || '',
      status: a.status
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Applications');
    XLSX.writeFile(wb, `applications-${Date.now()}.xlsx`);
    this.toast.show('Excel file exported', 'success');
  }

  exportSubjectsCsv() {
    if (!this.selectedCourseId) { this.toast.show('Please select a course', 'error'); return; }
    const course = this.courses.find(c => c.id === this.selectedCourseId);
    if (!course) return;

    const subjects: any[] = [];
    course.semesters.forEach(sem => {
      sem.subjects.forEach(sub => {
        subjects.push({
          name: sub.name,
          credits: sub.credits,
          semester: sem.id,
          isElective: sub.isElective || false
        });
      });
    });

    if (subjects.length === 0) { this.toast.show('No subjects to export', 'info'); return; }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(subjects);
    XLSX.utils.book_append_sheet(wb, ws, course.name);
    XLSX.writeFile(wb, `${course.name}-subjects-${Date.now()}.xlsx`);
    this.toast.show('Excel file exported', 'success');
  }

  viewStudentDetails(student: any) {
    this.selectedStudent = student;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedStudent = null;
  }

  importSubjectsFromExcel(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!this.selectedCourseId) { this.toast.show('Please select a course first', 'error'); return; }
    const semesterId = Number(this.selectedSemesterId) || 1;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const firstSheet = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(firstSheet, { defval: null });

        if (!rows || rows.length === 0) {
          this.toast.show('No rows found in the Excel file', 'info');
          return;
        }

        let added = 0;
        for (let i = 0; i < rows.length; i++) {
          const r = rows[i];
          const name = r.name ?? r.Name ?? r.subject ?? r.Subject ?? `Imported Subject ${i + 1}`;
          const credits = Number(r.credits ?? r.Credits ?? 6) || 6;
          const currentCredits = this.getSemesterCredits(this.selectedCourseId, semesterId);
          if (currentCredits + credits > 36) {
            this.toast.show(`Skipping "${name}" — would exceed semester limit`, 'error');
            continue;
          }
          const id = `${this.selectedCourseId}-s${semesterId}-sub-${Date.now()}-${i}`;
          const subject: Subject = { id, name, credits, semester: semesterId };
          this.adminService.addSubject(this.selectedCourseId, semesterId, subject);
          added++;
        }

        if (added > 0) {
          this.refresh();
          this.toast.show(`Imported ${added} subjects`, 'success');
        } else {
          this.toast.show('No subjects were imported', 'info');
        }
      } catch (err) {
        this.toast.show('Failed to import Excel file', 'error');
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  }
}

