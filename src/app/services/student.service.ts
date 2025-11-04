import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'http://localhost:8084/api';

  constructor(private http: HttpClient) {}

  // Get all students (for admin purposes)
  getAllStudents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/students`);
  }

  // Get student by ID
  getStudentById(id: number): Observable<Student> {
    return this.http.get<any>(`${this.apiUrl}/students/${id}`);
  }

  // Update student
  updateStudent(id: number, student: Student): Observable<any> {
    return this.http.put(`${this.apiUrl}/students/${id}`, student, {
      responseType: 'text' // If your backend returns plain text
    });
  }

  // Delete student
  deleteStudent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/students/${id}`, {
      responseType: 'text' // If your backend returns plain text
    });
  }

  // Get current student's profile
  getCurrentStudentProfile(): Observable<Student> {
    const currentStudent = JSON.parse(localStorage.getItem('currentStudent') || '{}');
    if (!currentStudent.id) {
      throw new Error('No student ID found in localStorage');
    }
    return this.getStudentById(currentStudent.id);
  }

  // Update current student's profile
  updateCurrentStudent(student: Student): Observable<any> {
    const currentStudent = JSON.parse(localStorage.getItem('currentStudent') || '{}');
    if (!currentStudent.id) {
      throw new Error('No student ID found in localStorage');
    }
    return this.updateStudent(currentStudent.id, student);
  }
}
