import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaLote'
})
export class FechaLotePipe implements PipeTransform {

  transform(value: string, fecha: Date | string): unknown {
    if(fecha){
      console.log(fecha);
      return "27/02/01";
    } else {
      return null
    }
  }

}
