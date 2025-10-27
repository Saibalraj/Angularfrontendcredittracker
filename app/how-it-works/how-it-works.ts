import { Component, NgModule } from '@angular/core';
import { Dashboard } from "../dashboard/dashboard";
import { RouterLink, RouterOutlet,Router} from '@angular/router';

@Component({
  selector: 'app-how-it-works',
  imports: [RouterOutlet],
  // imports: [RouterLink,RouterOutlet,Dashboard],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.css'
})
// @NgModule({
//   declarations: [HowItWorks],
//   imports: [Dashboard],
//   exports: [HowItWorks]
// })
export class HowItWorks {
  constructor(private router: Router) { }
  goTodashboard() {
    this.router.navigate(['dashboard']);
  }

}
