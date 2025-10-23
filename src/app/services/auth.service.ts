import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Student {
  rollNo: number;
  name: string;
  program: string;
  requiredCredits: number;
  password: string;
}

export interface LoginRequest {
  name: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/auth'; // ✅ Make sure your backend runs on this port

  constructor(private http: HttpClient) {}

  register(student: Student): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, student);
  }

  login(loginRequest: LoginRequest): Observable<Student> {
    return this.http.post<Student>(`${this.baseUrl}/login`, loginRequest);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }
}
