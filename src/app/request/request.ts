import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DocumentRequest {
  id: number;
  documentType: string;
  purpose: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Ready';
  requestDate: string;
  expectedDate?: string;
  remarks?: string;
}

@Component({
  selector: 'app-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './request.html',
  styleUrl: './request.css'
})
export class RequestComponent implements OnInit {
  requestForm = {
    documentType: '',
    purpose: '',
    remarks: ''
  };

  documentTypes = [
    'Transcript',
    'Degree Certificate',
    'Migration Certificate',
    'Character Certificate',
    'Bonafide Certificate',
    'Fee Receipt',
    'ID Card',
    'Other'
  ];

  requests: DocumentRequest[] = [
    {
      id: 1,
      documentType: 'Transcript',
      purpose: 'Higher Studies Application',
      status: 'Ready',
      requestDate: '2024-01-10',
      expectedDate: '2024-01-20',
      remarks: 'Ready for pickup'
    },
    {
      id: 2,
      documentType: 'Degree Certificate',
      purpose: 'Job Application',
      status: 'Approved',
      requestDate: '2024-01-15',
      expectedDate: '2024-01-25'
    },
    {
      id: 3,
      documentType: 'Character Certificate',
      purpose: 'Scholarship Application',
      status: 'Pending',
      requestDate: '2024-01-18'
    }
  ];

  message: string = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.showMessage('Document request system loaded!', 'success');
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  submitRequest() {
    if (!this.requestForm.documentType || !this.requestForm.purpose) {
      this.showMessage('Please fill in all required fields!', 'error');
      return;
    }

    const newRequest: DocumentRequest = {
      id: this.requests.length + 1,
      documentType: this.requestForm.documentType,
      purpose: this.requestForm.purpose,
      status: 'Pending',
      requestDate: new Date().toISOString().split('T')[0],
      remarks: this.requestForm.remarks
    };

    this.requests.unshift(newRequest);

    // Reset form
    this.requestForm = {
      documentType: '',
      purpose: '',
      remarks: ''
    };

    this.showMessage('Document request submitted successfully!', 'success');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Ready': return 'status-ready';
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      case 'Pending': return 'status-pending';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Ready': return '📄';
      case 'Approved': return '✅';
      case 'Rejected': return '❌';
      case 'Pending': return '⏳';
      default: return '';
    }
  }

  downloadDocument(request: DocumentRequest) {
    if (request.status === 'Ready') {
      this.showMessage('Document download started!', 'success');
      // Implement actual download logic
    } else {
      this.showMessage('Document is not ready for download yet!', 'error');
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
