import { Component, Input, OnInit } from '@angular/core';
import { Venta } from '../../../models/models';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modalventa',
  templateUrl: './modalventa.component.html',
  styleUrls: ['./modalventa.component.scss'],
})
export class ModalventaComponent implements OnInit {

  @Input() venta: Venta;
  encabezados = ['Código', 'Nombre', 'Cantidad', 'Precio', 'IVA', 'Total']
  

  constructor(private modalController: ModalController) { 

  }

  ngOnInit() {
  }

  closeModal() {
      this.modalController.dismiss();
  }

}
