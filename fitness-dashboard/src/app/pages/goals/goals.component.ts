import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss']
})
export class GoalsComponent implements OnInit, OnDestroy {

  private componentDestruction$ = new Subject();

  public mainFormGroup = this.fb.group({
    startDate: [null],
    endDate: [null],
    startWeight: [null],
    endWeight: [null],
  });

  constructor(
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    // Start date value change subscription
    this.mainFormGroup.get('startDate').valueChanges.pipe(
      takeUntil(this.componentDestruction$),
    ).subscribe(value => {
    });
  }

  ngOnDestroy() {
    this.componentDestruction$.next();
  }

}
