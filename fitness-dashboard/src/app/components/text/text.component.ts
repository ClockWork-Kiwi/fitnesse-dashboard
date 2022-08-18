import {Component, Input, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'field-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements OnInit {

  @Input() inputControl = new FormControl();
  @Input() label;

  constructor() { }

  ngOnInit() {
  }

}
