import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  student = {
    fullName: 'Sai Balraj',
    rollNo: '230714100038',
    email: '230714100038@centurionuniv.edu.in',
    phone: '7847079626',
    program: 'B.C.A',
    department: 'Computer Science',
    year: '3',
    semester: '5',
    dob: '2002-05-15',
    gender: 'Male',
    address: '123 Main Street, City, State 12345',
    guardian: 'Yerranna',
    emergencyContact: '7381271356',
    profilePhoto: null as string | null
  };

  isEditing = false;
  message: string = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(private router: Router) {}

  ngOnInit() {
    // Load student data from localStorage or API
    const savedData = localStorage.getItem('studentProfile');
    if (savedData) {
      this.student = { ...this.student, ...JSON.parse(savedData) };
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  editProfile() {
    this.isEditing = true;
  }

  saveProfile() {
    // Validate required fields
    if (!this.student.fullName || !this.student.email || !this.student.phone) {
      this.showMessage('Please fill in all required fields!', 'error');
      return;
    }

    // Save to localStorage (in real app, save to API)
    localStorage.setItem('studentProfile', JSON.stringify(this.student));

    this.isEditing = false;
    this.showMessage('Profile updated successfully!', 'success');
  }

  cancelEdit() {
    this.isEditing = false;
    // Reload original data
    const savedData = localStorage.getItem('studentProfile');
    if (savedData) {
      this.student = { ...this.student, ...JSON.parse(savedData) };
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files.length > 0 ? input.files[0] : null;

    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.showMessage('Please select a valid image file!', 'error');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showMessage('File size must be less than 5MB!', 'error');
        return;
      }

      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.student.profilePhoto = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
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
