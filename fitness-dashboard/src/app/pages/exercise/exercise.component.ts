import { Component, OnInit } from '@angular/core';
import {faMinusCircle, faPlusCircle} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-exercise',
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.scss']
})
export class ExerciseComponent implements OnInit {

  public addIcon = faPlusCircle;
  public removeIcon = faMinusCircle;

  constructor() { }

  ngOnInit() {
  }

}
