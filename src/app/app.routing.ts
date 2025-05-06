import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { DelineationComponent } from './views/delineation/delineation.component';

import { MainComponent } from './views/main/main.component';

const routes: Routes = [
  { path: 'main', component: MainComponent },
  { path: 'delineation', component: DelineationComponent },
  { path: '', redirectTo: '/main', pathMatch: 'full' },
  // Add other routes as needed
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes),
    BrowserModule,
    RouterModule.forRoot(routes, {
      useHash: true
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
