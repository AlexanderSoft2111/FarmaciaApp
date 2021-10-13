import { Component, OnInit } from '@angular/core';
import { Producto } from '../../../models/models';
import { PopoverController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-pop-add-producto',
  templateUrl: './pop-add-producto.component.html',
  styleUrls: ['./pop-add-producto.component.scss'],
})
export class PopAddProductoComponent implements OnInit {

  producto: Producto = {
    codigo: '',
    descripcion: '',
    lote: '',
    precio_compra: null,
    precio_venta: null,
    fecha_caducidad: new Date(),
    fecha_creacion: `${new Date().toLocaleString()}`,
    descuento: false
  }

  constructor(private popoverController: PopoverController,
              private fb: FormBuilder,) { }

  ngOnInit() {}

  add() {
      this.popoverController.dismiss(this.producto);
  }

  close() {
    this.popoverController.dismiss();
  }

}
