import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  title = 'student-frontend';

  user: any[] = [];

  userdata = {
    id: 0,
    rollNo: '',
    name: "",
    program: "",
    requiredCredits: '' ,
    password: ""
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getdata();
  }

  getdata() {
    this.http.get("http://localhost:8084/api/getAllstudents").subscribe((result) => {
      console.log(result);
      this.user = result as any[];
    });
  }

  adddata() {
    this.http.post("http://localhost:8084/api/student", this.userdata).subscribe((result) => {
      console.log('Student added:', result);
      this.getdata(); // Refresh the list
      this.resetForm();
    });
  }

  deletedata(id: number) {
    this.http.delete(`http://localhost:8084/api/stu/${id}`).subscribe((result) => {
      console.log('Student deleted:', result);
      this.getdata(); // Refresh the list
    });
  }

  updatedata() {
    this.http.put(`http://localhost:8084/api/updatestudents/${this.userdata.id}`, this.userdata).subscribe((result) => {
      console.log('Student updated:', result);
      this.getdata(); // Refresh the list
      this.resetForm();
    });
  }

  editStudent(student: any) {
    this.userdata = { ...student };
  }

  private resetForm() {
    this.userdata = {
      id: 0,
      rollNo: "",
      name: "",
      program: "",
      requiredCredits: "",
      password: ""
    };
  }
}
