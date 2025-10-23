import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Settings {
  emailNotifications: boolean;
  profileVisibility: string;
  twoFactorAuth: boolean;
  twoFactorMethod: string;
  showEmail: boolean;
  showPhone: boolean;
  dataSharing: boolean;
  showActivityStatus: boolean;
  theme: string;
  language: string;
  fontSize: string;
  timeFormat: string;
  autoSaveInterval: number;
  pushNotifications: boolean;
  emailDigest: boolean;
  soundAlerts: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class SettingsComponent implements OnInit {
  settings: Settings = {
    emailNotifications: true,
    profileVisibility: 'friends',
    twoFactorAuth: false,
    twoFactorMethod: 'app',
    showEmail: false,
    showPhone: false,
    dataSharing: true,
    showActivityStatus: true,
    theme: 'light',
    language: 'en',
    fontSize: 'medium',
    timeFormat: '12h',
    autoSaveInterval: 5,
    pushNotifications: true,
    emailDigest: true,
    soundAlerts: false
  };

  originalSettings: Settings = { ...this.settings };
  settingsChanged = false;

  // UI States
  showDeleteAccount = false;
  showChangePassword = false;
  deleteConfirmation = '';

  // Messages
  message = '';
  messageType: 'success-msg' | 'error-msg' | '' = '';

  // Password Data
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadSettings();
    this.applyTheme();
  }

  loadSettings() {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      this.originalSettings = { ...this.settings };
    }
  }

  onSettingChange(settingName?: string) {
    this.settingsChanged = !this.areSettingsEqual(this.settings, this.originalSettings);

    if (settingName === 'theme') {
      this.applyTheme();
    }
  }

  areSettingsEqual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  applyTheme() {
    const root = document.documentElement;
    if (this.settings.theme === 'dark' || (this.settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark-theme');
    } else {
      root.classList.remove('dark-theme');
    }
  }

  onLanguageChange() {
    this.showMessage('Language will change after page refresh', 'success-msg');
  }

  onTwoFactorToggle() {
    if (this.settings.twoFactorAuth) {
      this.showMessage('Two-factor authentication enabled. Please complete setup.', 'success-msg');
    }
  }

  saveSettings() {
    // Simulate API call
    localStorage.setItem('userSettings', JSON.stringify(this.settings));
    this.originalSettings = { ...this.settings };
    this.settingsChanged = false;

    this.showMessage('Settings saved successfully!', 'success-msg');

    // Apply changes immediately
    this.applyTheme();
  }

  resetSettings() {
    const defaultSettings: Settings = {
      emailNotifications: true,
      profileVisibility: 'friends',
      twoFactorAuth: false,
      twoFactorMethod: 'app',
      showEmail: false,
      showPhone: false,
      dataSharing: true,
      showActivityStatus: true,
      theme: 'light',
      language: 'en',
      fontSize: 'medium',
      timeFormat: '12h',
      autoSaveInterval: 5,
      pushNotifications: true,
      emailDigest: true,
      soundAlerts: false
    };

    this.settings = { ...defaultSettings };
    this.settingsChanged = true;
    this.applyTheme();
    this.showMessage('Settings reset to default values', 'success-msg');
  }

  cancelChanges() {
    this.settings = { ...this.originalSettings };
    this.settingsChanged = false;
    this.applyTheme();
    this.showMessage('Changes discarded', 'success-msg');
  }

  // Quick Actions
  exportData() {
    // Simulate data export
    const data = {
      settings: this.settings,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `settings-export-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    this.showMessage('Data exported successfully!', 'success-msg');
  }

  changePassword() {
    this.showChangePassword = true;
  }

  updatePassword() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.showMessage('New passwords do not match!', 'error-msg');
      return;
    }

    if (this.passwordData.newPassword.length < 6) {
      this.showMessage('Password must be at least 6 characters long!', 'error-msg');
      return;
    }

    // Simulate password update
    setTimeout(() => {
      this.showChangePassword = false;
      this.resetPasswordForm();
      this.showMessage('Password updated successfully!', 'success-msg');
    }, 1000);
  }

  resetPasswordForm() {
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  manageDevices() {
    this.showMessage('Device management feature coming soon!', 'success-msg');
  }

  deleteAccount() {
    if (this.deleteConfirmation === 'DELETE') {
      // Simulate account deletion
      setTimeout(() => {
        localStorage.removeItem('userSettings');
        this.showDeleteAccount = false;
        this.showMessage('Account deleted successfully. Redirecting...', 'success-msg');

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }, 1500);
    }
  }

  // Navigation
  goBack() {
    if (this.settingsChanged) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.router.navigate(['/dashboard']);
      }
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  // Message handling
  showMessage(text: string, type: 'success-msg' | 'error-msg') {
    this.message = text;
    this.messageType = type;

    // Auto-hide success messages after 5 seconds
    if (type === 'success-msg') {
      setTimeout(() => {
        this.clearMessage();
      }, 5000);
    }
  }

  clearMessage() {
    this.message = '';
    this.messageType = '';
  }

  // Prevent accidental navigation with unsaved changes
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: BeforeUnloadEvent) {
    if (this.settingsChanged) {
      $event.returnValue = true;
    }
  }
}
