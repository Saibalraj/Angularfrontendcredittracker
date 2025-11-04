import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AdminRegisterComponent } from './admin-register';
import { AdminService } from '../services/admin.service';

describe('AdminRegisterComponent', () => {
  let component: AdminRegisterComponent;
  let fixture: ComponentFixture<AdminRegisterComponent>;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;
  const routerSpy = { navigate: jasmine.createSpy('navigate') };

  beforeEach(async () => {
    adminServiceSpy = jasmine.createSpyObj('AdminService', ['addAdmin']);

    await TestBed.configureTestingModule({
      imports: [AdminRegisterComponent],
      providers: [
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should reject numeric-only username', () => {
    component.username = '12345';
    component.password = 'pass123';
    component.register();
    expect(component.message).toContain('letters');
    expect(adminServiceSpy.addAdmin).not.toHaveBeenCalled();
  });
});
