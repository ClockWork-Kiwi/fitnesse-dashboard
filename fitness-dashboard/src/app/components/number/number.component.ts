import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'field-number',
  templateUrl: './number.component.html',
  styleUrls: ['./number.component.scss']
})
export class NumberComponent implements OnInit {

  @Input() inputControl = new FormControl();
  @Input() hint;
  @Input() label;

  constructor() { }

  ngOnInit() {
  }

}
