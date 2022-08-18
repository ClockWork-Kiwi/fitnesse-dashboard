import { Component, OnInit } from '@angular/core';
import {faMinusCircle, faPlusCircle} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-nutrition',
  templateUrl: './nutrition.component.html',
  styleUrls: ['./nutrition.component.scss']
})
export class NutritionComponent implements OnInit {

  public addIcon = faPlusCircle;
  public removeIcon = faMinusCircle;

  constructor(
  ) { }

  ngOnInit() {
  }

}
