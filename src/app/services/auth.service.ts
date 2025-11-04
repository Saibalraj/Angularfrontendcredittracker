import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface Student {
username: any;
  id?: number;
  rollNo: number;
  name: string;
  program: string;
  requiredCredits: number;
  password?: string;
}

export interface LoginRequest {
username: any;
  rollNo: number;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8084/api';
  private currentStudentSubject = new BehaviorSubject<Student | null>(null);
  public currentStudent$ = this.currentStudentSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if student data exists in localStorage
    const savedStudent = localStorage.getItem('currentStudent');
    if (savedStudent) {
      this.currentStudentSubject.next(JSON.parse(savedStudent));
    }
  }

  // Student Registration
  register(student: Student): Observable<Student> {
    return this.http.post<Student>(`${this.apiUrl}/signup`, student);
  }

  // Student Login
  login(loginRequest: LoginRequest): Observable<Student> {
    return this.http.post<Student>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        tap(student => {
          // Store student data (without password) in localStorage
          const studentWithoutPassword = { ...student };
          delete studentWithoutPassword.password;
          this.currentStudentSubject.next(studentWithoutPassword);
          localStorage.setItem('currentStudent', JSON.stringify(studentWithoutPassword));
        })
      );
  }

  // Logout
  logout(): void {
    this.currentStudentSubject.next(null);
    localStorage.removeItem('currentStudent');
  }

  // Get current student
  getCurrentStudent(): Student | null {
    return this.currentStudentSubject.value;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.currentStudentSubject.value !== null;
  }
}
