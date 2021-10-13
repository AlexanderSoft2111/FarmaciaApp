import { Component, OnInit, Input } from '@angular/core';
import { Paths, TransaccionProducto } from '../../../models/models';
import { PopoverController } from '@ionic/angular';
import * as moment from 'moment';
import { timestamp } from 'rxjs/operators';
import { FirestoreService } from '../../../services/firestore.service';


@Component({
  selector: 'app-modal-kardex',
  templateUrl: './modal-kardex.component.html',
  styleUrls: ['./modal-kardex.component.scss'],
})
export class ModalKardexComponent implements OnInit {

  @Input() transaccion: TransaccionProducto;
  @Input() cantidad: number = 0;


  constructor(private popoverController: PopoverController,
              private firestoreService: FirestoreService) { 

    

  }

  ngOnInit() {

   const fecha = new Date(this.transaccion.fecha_transaccion);
   console.log(fecha);

  }


  closeModal() {
      this.popoverController.dismiss();
  }

}
