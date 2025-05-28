import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'events',
  standalone: true
})
export class EventsPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
