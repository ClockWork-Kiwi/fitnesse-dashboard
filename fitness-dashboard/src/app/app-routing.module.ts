import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { GoalsComponent } from "./pages/goals/goals.component";


const routes: Routes = [
  { path: '', component: GoalsComponent }, // Change this path to login screen later, for now dashboard is base screen
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
