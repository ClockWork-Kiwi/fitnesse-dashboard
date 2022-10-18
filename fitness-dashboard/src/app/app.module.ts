import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { GoalsComponent } from './pages/goals/goals.component';
import {ComponentsModule} from './components/components.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {PipesModule} from './pipes/pipes.module';
import {
  MatButtonModule,
  MatCardModule,
  MatExpansionModule,
  MatProgressSpinnerModule,
  MatSidenavModule,
  MatTooltipModule
} from '@angular/material';
import { NutritionComponent } from './pages/nutrition/nutrition.component';
import { ExerciseComponent } from './pages/exercise/exercise.component';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {HttpClientModule} from '@angular/common/http';
import { CountUpDirective } from './directives/count-up.directive';
import { LoginComponent } from './pages/login/login.component';
import {CookieService} from 'ngx-cookie-service';
import { RegisterComponent } from './pages/register/register.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    GoalsComponent,
    NutritionComponent,
    ExerciseComponent,
    CountUpDirective,
    LoginComponent,
    RegisterComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    ComponentsModule,
    PipesModule,
    FormsModule,
    ReactiveFormsModule,
    MatSidenavModule,
    FontAwesomeModule,
    MatExpansionModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
