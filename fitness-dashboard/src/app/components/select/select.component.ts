import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'field-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit {

  @Input() inputControl = new FormControl();
  @Input() label;
  @Input() options;

  constructor() { }

  ngOnInit() {
  }

}
