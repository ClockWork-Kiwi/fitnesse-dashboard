import {Component, Input, OnChanges, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.css']
})
export class DateComponent implements OnInit, OnChanges {

  @Input() inputControl;

  @ViewChild('dateField',  { static: false }) dateField;

  constructor(
  ) {}

  ngOnInit() {
  }

  ngOnChanges(changes) {
  }

}
