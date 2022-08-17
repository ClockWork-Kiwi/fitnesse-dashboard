import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'field-number',
  templateUrl: './number.component.html',
  styleUrls: ['./number.component.scss']
})
export class NumberComponent implements OnInit {

  @Input() inputControl;
  @Input() label;

  constructor() { }

  ngOnInit() {
  }

}
