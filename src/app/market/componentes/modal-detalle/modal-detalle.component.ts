import { Component, OnInit, Input } from '@angular/core';
import { TransaccionProducto } from '../../../models/models';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-modal-detalle',
  templateUrl: './modal-detalle.component.html',
  styleUrls: ['./modal-detalle.component.scss'],
})
export class ModalDetalleComponent implements OnInit {

  @Input() transaccion: TransaccionProducto;
  @Input() cantidad: number = 0;


  fecha = new Date();
  constructor(private popoverController: PopoverController) { 

    

  }

  ngOnInit() {


  }


  closeModal() {
      this.popoverController.dismiss();
  }

}
