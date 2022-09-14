import { Injectable } from '@angular/core';
import {of} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // Hard coded uid
  public userId$ = of(1);

  constructor() { }
}
