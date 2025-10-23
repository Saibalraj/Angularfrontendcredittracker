import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Course {
  code: string;
  name: string;
  credits: number;
  grade: string;
  points: number;
  semester: number;
}

interface Semester {
  number: number;
  courses: Course[];
  gpa: number;
  credits: number;
}

@Component({
  selector: 'app-transcript',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transcript.html',
  styleUrl: './transcript.css'
})
export class TranscriptComponent implements OnInit {
  studentInfo = {
    name: 'Sai Balraj',
    rollNo: '230714100038',
    program: 'B.C.A',
    department: 'Computer Science',
    admissionYear: '2023',
    expectedGraduation: '2026'
  };

  semesters: Semester[] = [
    {
      number: 1,
      courses: [
        { code: 'MATH101', name: 'Mathematics I', credits: 4, grade: 'A', points: 4.0, semester: 1 },
        { code: 'PHY101', name: 'Physics', credits: 4, grade: 'A-', points: 3.7, semester: 1 },
        { code: 'CS101', name: 'Programming Fundamentals', credits: 3, grade: 'A', points: 4.0, semester: 1 },
        { code: 'ENG101', name: 'English Communication', credits: 2, grade: 'B+', points: 3.3, semester: 1 }
      ],
      gpa: 3.8,
      credits: 13
    },
    {
      number: 2,
      courses: [
        { code: 'MATH102', name: 'Mathematics II', credits: 4, grade: 'A-', points: 3.7, semester: 2 },
        { code: 'CS102', name: 'Data Structures', credits: 4, grade: 'A', points: 4.0, semester: 2 },
        { code: 'CS103', name: 'Digital Electronics', credits: 3, grade: 'B+', points: 3.3, semester: 2 },
        { code: 'MECH101', name: 'Mechanics', credits: 4, grade: 'A-', points: 3.7, semester: 2 }
      ],
      gpa: 3.7,
      credits: 15
    },
    {
      number: 3,
      courses: [
        { code: 'CS201', name: 'Algorithms', credits: 4, grade: 'A', points: 4.0, semester: 3 },
        { code: 'CS202', name: 'Database Systems', credits: 4, grade: 'A-', points: 3.7, semester: 3 },
        { code: 'CS203', name: 'Computer Networks', credits: 3, grade: 'B+', points: 3.3, semester: 3 },
        { code: 'CS204', name: 'Operating Systems', credits: 4, grade: 'A', points: 4.0, semester: 3 }
      ],
      gpa: 3.8,
      credits: 15
    },
    {
      number: 4,
      courses: [
        { code: 'CS301', name: 'Machine Learning', credits: 4, grade: 'A', points: 4.0, semester: 4 },
        { code: 'CS302', name: 'Web Development', credits: 4, grade: 'A', points: 4.0, semester: 4 },
        { code: 'CS303', name: 'Mobile App Development', credits: 3, grade: 'A-', points: 3.7, semester: 4 },
        { code: 'CS304', name: 'Cloud Computing', credits: 4, grade: 'A', points: 4.0, semester: 4 }
      ],
      gpa: 3.9,
      credits: 15
    }
  ];

  selectedSemester: number = 0; // 0 means all semesters
  message: string = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.showMessage('Academic transcript loaded!', 'success');
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  selectSemester(semester: number) {
    this.selectedSemester = semester;
  }

  getFilteredCourses(): Course[] {
    if (this.selectedSemester === 0) {
      return this.semesters.flatMap(sem => sem.courses);
    }
    return this.semesters.find(sem => sem.number === this.selectedSemester)?.courses || [];
  }

  getOverallGPA(): number {
    const allCourses = this.semesters.flatMap(sem => sem.courses);
    const totalPoints = allCourses.reduce((sum, course) => sum + (course.points * course.credits), 0);
    const totalCredits = allCourses.reduce((sum, course) => sum + course.credits, 0);
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  }

  getTotalCredits(): number {
    return this.semesters.reduce((sum, sem) => sum + sem.credits, 0);
  }

  getGradeClass(grade: string): string {
    if (grade.startsWith('A')) return 'grade-a';
    if (grade.startsWith('B')) return 'grade-b';
    if (grade.startsWith('C')) return 'grade-c';
    return 'grade-d';
  }

  exportTranscript() {
    const data = {
      studentInfo: this.studentInfo,
      semesters: this.semesters,
      overallGPA: this.getOverallGPA(),
      totalCredits: this.getTotalCredits(),
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transcript-${this.studentInfo.rollNo}-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    this.showMessage('Transcript exported successfully!', 'success');
  }

  printTranscript() {
    window.print();
  }

  showMessage(text: string, type: 'success' | 'error') {
    this.message = text;
    this.messageType = type;

    if (type === 'success') {
      setTimeout(() => {
        this.clearMessage();
      }, 3000);
    }
  }

  clearMessage() {
    this.message = '';
    this.messageType = '';
  }
}
