import {DateComponent} from "./date/date.component";
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatInputModule} from "@angular/material/input";
import {MatNativeDateModule} from "@angular/material/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { NumberComponent } from './number/number.component';
import { TextComponent } from './text/text.component';
import { SelectComponent } from './select/select.component';
import {MatAutocompleteModule, MatExpansionModule, MatSelectModule, MatSnackBarModule} from '@angular/material';

@NgModule({
  declarations: [
    DateComponent,
    NumberComponent,
    TextComponent,
    SelectComponent
  ],
  imports: [
    BrowserModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatSnackBarModule,
  ],
  exports: [
    DateComponent,
    NumberComponent,
    TextComponent,
    SelectComponent,
  ],
  providers: [],
  bootstrap: []
})
export class ComponentsModule { }
