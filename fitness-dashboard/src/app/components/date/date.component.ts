import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'field-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss']
})
export class DateComponent implements OnInit {

  @Input() inputControl = new FormControl();
  @Input() label;

  constructor(
  ) {}

  ngOnInit() {
  }

}
