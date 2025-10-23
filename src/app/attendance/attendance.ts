import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TruncatePipe } from '../shared/truncate.pipe';

interface AttendanceRecord {
  id: string;
  date: string;
  subject: string;
  status: 'present' | 'absent' | 'late';
  time?: string;
  remarks?: string;
}

interface StudentInfo {
  name: string;
  rollNo: string;
  program: string;
  department: string;
  semester: string;
}

interface SubjectStat {
  subject: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, TruncatePipe],
  templateUrl: './attendance.html',
  styleUrls: ['./attendance.css']
})
export class AttendanceComponent implements OnInit {
  // Student Information
  studentInfo: StudentInfo = {
    name: 'Sai Balraj',
    rollNo: '23071410038',
    program: 'B.C.A',
    department: 'Computer Science',
    semester: '4rd Semester'
  };

  // Attendance Data
  attendanceRecords: AttendanceRecord[] = [
    {
      id: '1',
      date: '2024-01-15',
      subject: 'Data Structures',
      status: 'present',
      time: '09:00 AM',
      remarks: 'On time'
    },
    {
      id: '2',
      date: '2024-01-16',
      subject: 'Algorithms',
      status: 'present',
      time: '10:00 AM'
    },
    {
      id: '3',
      date: '2024-01-17',
      subject: 'Database Systems',
      status: 'absent',
      remarks: 'Medical leave'
    },
    {
      id: '4',
      date: '2024-01-18',
      subject: 'Operating Systems',
      status: 'late',
      time: '09:15 AM',
      remarks: 'Traffic delay'
    },
    {
      id: '5',
      date: '2024-01-19',
      subject: 'Computer Networks',
      status: 'present',
      time: '11:00 AM'
    }
  ];

  // Subjects
  subjects = [
    { name: 'Data Structures', code: 'CS201' },
    { name: 'Algorithms', code: 'CS202' },
    { name: 'Database Systems', code: 'CS203' },
    { name: 'Operating Systems', code: 'CS204' },
    { name: 'Computer Networks', code: 'CS205' }
  ];

  // Filter and Sort
  filterStatus: string = 'all';
  filterSubject: string = 'all';
  filterMonth: string = 'all';
  sortBy: string = 'date-desc';
  filteredRecords: AttendanceRecord[] = [];

  // Messages
  message: string = '';
  messageType: 'success' | 'error' | '' = '';

  // Months for filtering
  months = [
    { value: '01', name: 'January' },
    { value: '02', name: 'February' },
    { value: '03', name: 'March' },
    { value: '04', name: 'April' },
    { value: '05', name: 'May' },
    { value: '06', name: 'June' },
    { value: '07', name: 'July' },
    { value: '08', name: 'August' },
    { value: '09', name: 'September' },
    { value: '10', name: 'October' },
    { value: '11', name: 'November' },
    { value: '12', name: 'December' }
  ];

  // Monthly trends data
  monthlyTrends = [
    { month: 'Jan', percentage: 85 },
    { month: 'Feb', percentage: 92 },
    { month: 'Mar', percentage: 78 },
    { month: 'Apr', percentage: 88 },
    { month: 'May', percentage: 95 },
    { month: 'Jun', percentage: 82 }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.applyFilters();
  }

  // Navigation
  goBack() {
    this.router.navigate(['/dashboard']);
  }

  // Statistics
  getAttendanceStats() {
    const total = this.attendanceRecords.length;
    const present = this.attendanceRecords.filter(r => r.status === 'present').length;
    const absent = this.attendanceRecords.filter(r => r.status === 'absent').length;
    const late = this.attendanceRecords.filter(r => r.status === 'late').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, percentage };
  }

  getCurrentMonthStats() {
    const currentMonth = new Date().getMonth() + 1;
    const monthRecords = this.attendanceRecords.filter(record => {
      const recordMonth = new Date(record.date).getMonth() + 1;
      return recordMonth === currentMonth;
    });

    const total = monthRecords.length;
    const present = monthRecords.filter(r => r.status === 'present').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, percentage };
  }

  getCurrentWeekStats() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const weekRecords = this.attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startOfWeek && recordDate <= today;
    });

    const total = weekRecords.length;
    const present = weekRecords.filter(r => r.status === 'present').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, percentage };
  }

  getSubjectStats(): SubjectStat[] {
    return this.subjects.map(subject => {
      const subjectRecords = this.attendanceRecords.filter(record =>
        record.subject === subject.name
      );

      const total = subjectRecords.length;
      const present = subjectRecords.filter(r => r.status === 'present').length;
      const absent = subjectRecords.filter(r => r.status === 'absent').length;
      const late = subjectRecords.filter(r => r.status === 'late').length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      return { subject: subject.name, present, absent, late, total, percentage };
    });
  }

  // Filtering and Sorting
  applyFilters() {
    let filtered = [...this.attendanceRecords];

    // Apply status filter
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(record => record.status === this.filterStatus);
    }

    // Apply subject filter
    if (this.filterSubject !== 'all') {
      filtered = filtered.filter(record => record.subject === this.filterSubject);
    }

    // Apply month filter
    if (this.filterMonth !== 'all') {
      filtered = filtered.filter(record => {
        const recordMonth = new Date(record.date).getMonth() + 1;
        return recordMonth.toString().padStart(2, '0') === this.filterMonth;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'subject':
          return a.subject.localeCompare(b.subject);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    this.filteredRecords = filtered;
  }

  // Utility Functions
  getStatusClass(status: string): string {
    switch (status) {
      case 'present': return 'status-present';
      case 'absent': return 'status-absent';
      case 'late': return 'status-late';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'present': return '✅';
      case 'absent': return '❌';
      case 'late': return '⏰';
      default: return '';
    }
  }

  getDayName(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  getSubjectCode(subjectName: string): string {
    const subject = this.subjects.find(s => s.name === subjectName);
    return subject ? subject.code : '';
  }

  getPercentageClass(percentage: number): string {
    if (percentage >= 85) return 'percentage-high';
    if (percentage >= 75) return 'percentage-medium';
    return 'percentage-low';
  }

  // Actions
  exportAttendance() {
    const data = {
      studentInfo: this.studentInfo,
      attendanceRecords: this.filteredRecords,
      stats: this.getAttendanceStats(),
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${this.studentInfo.rollNo}-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    this.showMessage('Attendance data exported successfully!', 'success');
  }

  printAttendance() {
    window.print();
  }

  refreshData() {
    this.applyFilters();
    this.showMessage('Data refreshed successfully!', 'success');
  }

  // Message handling
  showMessage(text: string, type: 'success' | 'error') {
    this.message = text;
    this.messageType = type;

    if (type === 'success') {
      setTimeout(() => {
        this.clearMessage();
      }, 5000);
    }
  }

  clearMessage() {
    this.message = '';
    this.messageType = '';
  }
}
