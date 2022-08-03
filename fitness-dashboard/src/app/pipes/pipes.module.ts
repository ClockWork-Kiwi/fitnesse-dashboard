import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetControlPipe } from './get-control/get-control.pipe';



@NgModule({
  declarations: [
    GetControlPipe
  ],
  exports: [
    GetControlPipe
  ],
  imports: [
    CommonModule
  ]
})
export class PipesModule { }
