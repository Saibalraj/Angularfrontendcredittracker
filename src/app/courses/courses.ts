import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService, SubjectApplication } from '../services/admin.service';
import { Course, Subject } from '../models/course.model';

interface AppliedSubject extends Subject {
  status?: 'pending' | 'approved' | 'rejected';
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses.html',
  styleUrls: ['./courses.css']
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  selectedCourseId: string = '';
  selectedSemesterId: number = 1;
  availableSubjects: Subject[] = [];
  appliedSubjects: AppliedSubject[] = [];
  studentRoll: string = '';

  constructor(private admin: AdminService, private router: Router) {}

  ngOnInit(): void {
    this.courses = this.admin.getCourses();
    const userRaw = localStorage.getItem('currentUser');
    if (userRaw) {
      try {
        const u = JSON.parse(userRaw) as any;
        this.studentRoll = u.rollNo || u.id || u.roll || '';
        this.selectedCourseId = (u.program || this.courses[0]?.id || 'bca');
      } catch {}
    } else if (this.courses[0]) {
      this.selectedCourseId = this.courses[0].id;
    }
    this.loadSemester();
    this.loadApplied();
  }

  loadSemester() {
    const c = this.courses.find(x => x.id === this.selectedCourseId);
    this.availableSubjects = c ? (c.semesters.find(s => s.id === this.selectedSemesterId)?.subjects || []) : [];
  }

  loadApplied() {
    try {
      // Get selected subjects and their application status
      const selections = JSON.parse(localStorage.getItem('studentSelections') || '{}');
      const subjects = selections[this.studentRoll] || [];
      const applications = this.admin.getApplications()
        .filter(app => app.studentRoll === this.studentRoll);

      // Merge status into applied subjects
      this.appliedSubjects = subjects.map((sub: Subject) => {
        const app = applications.find(a => a.subject.id === sub.id);
        return {
          ...sub,
          status: app ? app.status : 'pending'
        };
      });
    } catch {
      this.appliedSubjects = [];
    }
  }

  apply(subject: Subject) {
    // check fee pending (simple flag in currentUser)
    const current = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (current.feePending) {
      alert('Fee pending – cannot register in subjects');
      return;
    }

    // ensure credits per semester <=36
    const semesterCredits = this.appliedSubjects.reduce((s, sub) => s + (sub.credits || 0), 0);
    if (semesterCredits + subject.credits > 36) {
      alert('Maximum credit exceeded for semester (36)');
      return;
    }

    // create application and persist via admin service
    const id = 'app-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const application: SubjectApplication = {
      id,
      studentRoll: this.studentRoll,
      courseId: this.selectedCourseId,
      semesterId: this.selectedSemesterId,
      subject: subject,
      status: 'pending'
    };
    this.admin.applySubject(application);

    // locally reflect as applied (pending)
    const appliedSubject: AppliedSubject = { ...subject, status: 'pending' };
    this.appliedSubjects.push(appliedSubject);
    const map = JSON.parse(localStorage.getItem('studentSelections') || '{}');
    map[this.studentRoll] = this.appliedSubjects;
    localStorage.setItem('studentSelections', JSON.stringify(map));
  }

  removeApplied(subjectId: string) {
    // Remove from applied subjects
    this.appliedSubjects = this.appliedSubjects.filter(s => s.id !== subjectId);
    const map = JSON.parse(localStorage.getItem('studentSelections') || '{}');
    map[this.studentRoll] = this.appliedSubjects;
    localStorage.setItem('studentSelections', JSON.stringify(map));

    // Remove any pending applications
    const applications = this.admin.getApplications();
    const updated = applications.filter(app =>
      !(app.studentRoll === this.studentRoll && app.subject.id === subjectId));
    localStorage.setItem('app_applications_v1', JSON.stringify(updated));
  }

  getSemesterCreditTotal(): number {
    return this.appliedSubjects.reduce((s, sub) => s + (sub.credits || 0), 0);
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  }

  isSubjectApplied(subjectId: string): boolean {
    return this.appliedSubjects.some(s => s.id === subjectId);
  }

  showProfile() {
    this.router.navigate(['/profile']);
  }
}

