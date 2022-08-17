import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'field-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss']
})
export class DateComponent implements OnInit {

  @Input() inputControl;
  @Input() label;

  constructor(
  ) {}

  ngOnInit() {
  }

}
