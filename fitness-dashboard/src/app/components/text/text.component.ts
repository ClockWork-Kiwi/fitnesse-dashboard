import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';
import {filter, map, startWith, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'field-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements OnInit, OnDestroy {

  @Input() inputControl = new FormControl();
  @Input() hint;
  @Input() label;
  @Input() options;
  @Input() password = false;

  @Output('blur') blur = new EventEmitter();

  private componentDestruction$ = new Subject();
  public filteredOptions$;

  constructor() { }

  private _filter(text) {
    if (!this.options || !this.options.length) { return []; }
    const filterText = text.toLowerCase();

    return this.options.filter(option => option.value.toLowerCase().includes(filterText));
  }

  ngOnInit() {
    this.filteredOptions$ = this.inputControl.valueChanges.pipe(
      takeUntil(this.componentDestruction$),
      startWith(''),
      map(value => this._filter(value || ''))
    );
  }

  ngOnDestroy() {
    this.componentDestruction$.next();
  }

}
