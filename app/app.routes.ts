import { NgModule } from '@angular/core';
import {Routes } from '@angular/router';
import { Dashboard} from './dashboard/dashboard'; // 👈 Make sure to import your component

export const routes: Routes = [
      { path: 'dashboard', component: Dashboard},
  
];
// src/app/app-routing.module.ts



// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { Dashboard } from './dashboard/dashboard';
// import { HowItWorks } from './how-it-works/how-it-works';
// import { Course } from './courses/courses/courses';

// const routes: Routes = [
//   // Default route redirects to 'how-it-works'
//   { path: '', redirectTo: '/how-it-works', pathMatch: 'full' },
//   { path: 'how-it-works', component: HowItWorks },
//   { path: 'dashboard', component: Dashboard },
//   { path: 'courses', component: Courses },
//   // Wildcard route for any other path
//   { path: '**', redirectTo: '/how-it-works' }
// ];

// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule]
// })
// export class AppRoutingModule { }