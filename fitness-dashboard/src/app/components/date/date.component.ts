import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss']
})
export class DateComponent implements OnInit, OnChanges {

  @Input() inputControl;
  @Input() label;

  @ViewChild('dateField',  { static: false }) dateField;

  constructor(
  ) {}

  ngOnInit() {
  }

  ngOnChanges(changes) {
  }

}
