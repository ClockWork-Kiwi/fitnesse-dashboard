import { Pipe, PipeTransform } from '@angular/core';
import {FormControl} from '@angular/forms';

@Pipe({
  name: 'getControl'
})
export class GetControlPipe implements PipeTransform {

  transform(value: any, ...args: any[]): any {
    if (!!value.controls[args[0]]) {
      return value.controls[args[0]];
    }
  }

}
