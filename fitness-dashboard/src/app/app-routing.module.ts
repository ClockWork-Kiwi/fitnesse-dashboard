import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from "./pages/dashboard/dashboard.component";
import { GoalsComponent } from "./pages/goals/goals.component";
import { NutritionComponent } from './pages/nutrition/nutrition.component';
import { ExerciseComponent } from './pages/exercise/exercise.component';


const routes: Routes = [
  { path: '', component: GoalsComponent }, // Change this path to login screen later, for now dashboard is base screen
  { path: 'dashboard', component: DashboardComponent },
  { path: 'goals', component: GoalsComponent },
  { path: 'nutrition', component: NutritionComponent },
  { path: 'exercise', component: ExerciseComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
