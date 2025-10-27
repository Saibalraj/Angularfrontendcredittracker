import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./navbar/navbar";
import { HeroSection } from "./hero-section/hero-section";
import { Features } from "./features/features";
import { HowItWorks } from './how-it-works/how-it-works';
import { SocialProof } from './social-proof/social-proof';
import { Analytics } from './analytics/analytics';
import { Footer } from './footer/footer';
// import { AppRoutingModule } from "./app.routes";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Navbar, HeroSection, Features, HowItWorks, SocialProof, Analytics, Footer,RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('my-angular-app');
}
