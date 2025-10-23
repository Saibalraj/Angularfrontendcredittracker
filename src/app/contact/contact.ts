import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ContactMessage {
  id: number;
  subject: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Resolved';
  date: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class ContactComponent implements OnInit {
  contactForm = {
    subject: '',
    message: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High'
  };

  messages: ContactMessage[] = [
    {
      id: 1,
      subject: 'Academic Query',
      message: 'I need clarification about the course curriculum for next semester.',
      priority: 'Medium',
      status: 'Resolved',
      date: '2024-01-15'
    },
    {
      id: 2,
      subject: 'Grade Concern',
      message: 'I would like to discuss my recent exam results.',
      priority: 'High',
      status: 'In Progress',
      date: '2024-01-18'
    }
  ];

  message: string = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.showMessage('Contact advisor system loaded!', 'success');
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  submitMessage() {
    if (!this.contactForm.subject || !this.contactForm.message) {
      this.showMessage('Please fill in all required fields!', 'error');
      return;
    }

    const newMessage: ContactMessage = {
      id: this.messages.length + 1,
      subject: this.contactForm.subject,
      message: this.contactForm.message,
      priority: this.contactForm.priority,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };

    this.messages.unshift(newMessage);

    // Reset form
    this.contactForm = {
      subject: '',
      message: '',
      priority: 'Medium'
    };

    this.showMessage('Message sent successfully! We will get back to you soon.', 'success');
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Resolved': return 'status-resolved';
      case 'In Progress': return 'status-progress';
      case 'Pending': return 'status-pending';
      default: return '';
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
