import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'field-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements OnInit {

  @Input() inputControl;
  @Input() label;

  constructor() { }

  ngOnInit() {
  }

}
