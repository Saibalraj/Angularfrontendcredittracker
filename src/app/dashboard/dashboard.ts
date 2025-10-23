import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Subject {
  id: number;
  name: string;
  credits: number;
  grade: number;
}

interface Semester {
  id: number;
  subjects: Subject[];
  totalCredits: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  // Student Information
  studentName: string = 'Sai Balraj';
  enrolledCourses: number = 8;
  profileIncomplete: boolean = true;

  // Academic Data
  semesterData: Semester[] = [
    {
      id: 1,
      totalCredits: 22,
      subjects: [
        { id: 1, name: 'Mathematics I', credits: 4, grade: 78 },
        { id: 2, name: 'Physics', credits: 4, grade: 82 },
        { id: 3, name: 'Programming Fundamentals', credits: 3, grade: 85 },
        { id: 4, name: 'English Communication', credits: 2, grade: 75 },
        { id: 5, name: 'Engineering Drawing', credits: 3, grade: 70 },
        { id: 6, name: 'Chemistry', credits: 4, grade: 80 }
      ]
    },
    {
      id: 2,
      totalCredits: 24,
      subjects: [
        { id: 1, name: 'Mathematics II', credits: 4, grade: 82 },
        { id: 2, name: 'Data Structures', credits: 4, grade: 88 },
        { id: 3, name: 'Digital Electronics', credits: 3, grade: 76 },
        { id: 4, name: 'Mechanics', credits: 4, grade: 84 },
        { id: 5, name: 'Environmental Science', credits: 2, grade: 90 },
        { id: 6, name: 'Economics', credits: 3, grade: 78 },
        { id: 7, name: 'Lab: Programming', credits: 2, grade: 92 }
      ]
    },
    {
      id: 3,
      totalCredits: 20,
      subjects: [
        { id: 1, name: 'Algorithms', credits: 4, grade: 75 },
        { id: 2, name: 'Database Systems', credits: 4, grade: 82 },
        { id: 3, name: 'Computer Networks', credits: 3, grade: 78 },
        { id: 4, name: 'Operating Systems', credits: 4, grade: 80 },
        { id: 5, name: 'Software Engineering', credits: 3, grade: 85 }
      ]
    },
    {
      id: 4,
      totalCredits: 26,
      subjects: [
        { id: 1, name: 'Machine Learning', credits: 4, grade: 89 },
        { id: 2, name: 'Web Development', credits: 4, grade: 92 },
        { id: 3, name: 'Mobile App Development', credits: 3, grade: 85 },
        { id: 4, name: 'Cloud Computing', credits: 4, grade: 88 },
        { id: 5, name: 'Project Management', credits: 3, grade: 82 },
        { id: 6, name: 'Elective I', credits: 4, grade: 90 },
        { id: 7, name: 'Lab: Web Technologies', credits: 2, grade: 94 }
      ]
    },
    {
      id: 5,
      totalCredits: 24,
      subjects: [
        { id: 1, name: 'Artificial Intelligence', credits: 4, grade: 87 },
        { id: 2, name: 'Cybersecurity', credits: 4, grade: 85 },
        { id: 3, name: 'Big Data Analytics', credits: 3, grade: 82 },
        { id: 4, name: 'Internet of Things', credits: 4, grade: 88 },
        { id: 5, name: 'Elective II', credits: 4, grade: 84 },
        { id: 6, name: 'Project Work', credits: 5, grade: 90 }
      ]
    },
    {
      id: 6,
      totalCredits: 22,
      subjects: [
        { id: 1, name: 'Deep Learning', credits: 4, grade: 86 },
        { id: 2, name: 'Blockchain Technology', credits: 4, grade: 83 },
        { id: 3, name: 'Elective III', credits: 4, grade: 85 },
        { id: 4, name: 'Elective IV', credits: 4, grade: 87 },
        { id: 5, name: 'Internship', credits: 6, grade: 88 }
      ]
    }
  ];

  // UI State
  selectedSemester: number = 1;
  currentSemesterPage: number = 0;
  semestersPerPage: number = 4;
  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: string = 'success';

  // Computed Properties
  get totalSubjects(): number {
    return this.semesterData.reduce((total, semester) => total + semester.subjects.length, 0);
  }

  get totalCredits(): number {
    return this.semesterData.reduce((total, semester) => total + semester.totalCredits, 0);
  }

  get overallPercentage(): number {
    const totalGradePoints = this.semesterData.reduce((total, semester) => {
      return total + semester.subjects.reduce((semTotal, subject) => semTotal + subject.grade, 0);
    }, 0);
    return Math.round(totalGradePoints / this.totalSubjects);
  }

  get displayedSemesters(): Semester[] {
    const start = this.currentSemesterPage * this.semestersPerPage;
    return this.semesterData.slice(start, start + this.semestersPerPage);
  }

  get maxSemesterPage(): number {
    return Math.ceil(this.semesterData.length / this.semestersPerPage) - 1;
  }

  constructor(private router: Router) {}

  ngOnInit() {
    // Auto-select first semester on load
    this.selectedSemester = 1;
    this.showNotificationMessage('Welcome to your dashboard!', 'success');
  }

  // Semester Navigation
  selectSemester(semesterId: number) {
    this.selectedSemester = semesterId;
    this.showNotificationMessage(`Viewing Semester ${semesterId} details`, 'info');
  }

  previousSemesters() {
    if (this.currentSemesterPage > 0) {
      this.currentSemesterPage--;
    }
  }

  nextSemesters() {
    if (this.currentSemesterPage < this.maxSemesterPage) {
      this.currentSemesterPage++;
    }
  }

  // Data Getters
  getSemesterSubjects(semesterId: number): Subject[] {
    const semester = this.semesterData.find(s => s.id === semesterId);
    return semester ? semester.subjects : [];
  }

  getSemesterPercentage(semesterId: number): number {
    const semester = this.semesterData.find(s => s.id === semesterId);
    if (!semester) return 0;

    const totalGrade = semester.subjects.reduce((sum, subject) => sum + subject.grade, 0);
    return Math.round(totalGrade / semester.subjects.length);
  }

  getSemesterCredits(semesterId: number): number {
    const semester = this.semesterData.find(s => s.id === semesterId);
    return semester ? semester.totalCredits : 0;
  }

  getSemesterGPA(semesterId: number): number {
    const percentage = this.getSemesterPercentage(semesterId);
    // Simple percentage to GPA conversion (scale: 4.0)
    return Math.min(4.0, (percentage / 100) * 4);
  }

  // Grade Utilities
  getGradeLetter(percentage: number): string {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  getGradeClass(percentage: number): string {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 70) return 'good';
    if (percentage >= 60) return 'average';
    return 'poor';
  }

  // Navigation Functions - All properly linked to components
  viewProfile() {
    this.showNotificationMessage('Opening profile...', 'info');
    setTimeout(() => {
      this.router.navigate(['/profile']);
    }, 1000);
  }

  viewCourses() {
    this.showNotificationMessage('Loading courses...', 'info');
    setTimeout(() => {
      this.router.navigate(['/transcript']);
    }, 1000);
  }

  openSettings() {
    this.showNotificationMessage('Opening settings...', 'info');
    setTimeout(() => {
      this.router.navigate(['/settings']);
    }, 1000);
  }

  exportGrades() {
    this.showNotificationMessage('Exporting grade report...', 'success');
    setTimeout(() => {
      const data = {
        studentName: this.studentName,
        semesterData: this.semesterData,
        overallPercentage: this.overallPercentage,
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `grades-${this.studentName.replace(' ', '-')}-${new Date().getTime()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }, 2000);
  }

  downloadTranscript() {
    this.showNotificationMessage('Preparing transcript download...', 'success');
    setTimeout(() => {
      this.router.navigate(['/transcript']);
    }, 1000);
  }

  viewAttendance() {
    this.showNotificationMessage('Loading attendance records...', 'info');
    setTimeout(() => {
      this.router.navigate(['/attendance']);
    }, 1000);
  }

  contactAdvisor() {
    this.showNotificationMessage('Opening advisor contact form...', 'info');
    setTimeout(() => {
      this.router.navigate(['/contact']);
    }, 1000);
  }

  requestDocuments() {
    this.showNotificationMessage('Opening document request form...', 'info');
    setTimeout(() => {
      this.router.navigate(['/request']);
    }, 1000);
  }

  logout() {
    this.showNotificationMessage('Logging out...', 'info');
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1000);
  }

  // Notification System
  showNotificationMessage(message: string, type: string = 'info') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;

    setTimeout(() => {
      this.hideNotification();
    }, 3000);
  }

  hideNotification() {
    this.showNotification = false;
  }
}
