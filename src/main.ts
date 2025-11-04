import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { LoginComponent } from './app/login/login';

bootstrapApplication(LoginComponent, {
  providers: [provideRouter(routes)]
}).catch(err => console.error(err));
