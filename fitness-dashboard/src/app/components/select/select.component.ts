import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit {

  @Input() inputControl;
  @Input() label;
  @Input() options;

  constructor() { }

  ngOnInit() {
  }

}
