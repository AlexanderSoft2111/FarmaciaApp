import { Component, OnInit } from '@angular/core';
import { Venta } from 'src/app/models/models';
import { VentaService } from '../../../services/venta.service';
import { ModalController } from '@ionic/angular';
import { ModalventaComponent } from '../../componentes/modalventa/modalventa.component';
import { InteraccionService } from '../../../services/interaccion.service';
import { FireAuthService } from '../../../services/fire-auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss'],
})
export class VentasComponent implements OnInit {

  ventas: Venta[] = [];
  encabezados = ['Venta', 'Fecha', 'Productos', 'IVA', 'Total']
  encabezadosValores = ['', '', 'Productos', 'IVA', 'Total']
  vendedor = true;
  uidAdmin = environment.uidAdmin;

  valores = {
      total: 0,
      iva: 0,
      productos: 0,
  }
  

  constructor(private ventaService: VentaService,
              private modalController: ModalController,
              private interaccionService: InteraccionService,
              private fireAuthService: FireAuthService) { 
          this.permisos();      
          this.ventas = this.ventaService.ventas;
          this.getValores();
          this.ventaService.getVentasChanges().subscribe( res => {
                if (res) {
                    this.ventas = res;
                    console.log('ventas -> ', this.ventas);
                    this.getValores();
                }
          });
  }

  ngOnInit() {
  }

  permisos(){
    this.fireAuthService.stateAuth().subscribe( res => {
        if(res !== null){
          if (res.uid === this.uidAdmin){
                this.vendedor = false;
          }
          
        }
    });
  }

  getValores() {
      if (this.ventas.length) {
          this.ventas.forEach( venta => {
                this.valores.iva = this.valores.iva + venta.iva; 
                this.valores.productos = this.valores.productos + venta.productos.length; 
                this.valores.total = this.valores.total + venta.total; 
                venta.productos.forEach( (item, index) => {
                  if (!item.producto.producto.descripcion) {
                        venta.productos.splice(index, 1);
                  }
                });
          });
      } else {
            this.valores = {
              total: 0,
              iva: 0,
              productos: 0,
            }
      }
      

  }  

  async openModalVenta(venta: Venta) {
    const modal = await this.modalController.create({
      component: ModalventaComponent,
      backdropDismiss: true,
      componentProps: {venta},
      mode: 'ios'
    });
    await modal.present();
  }

  resetReport() {
    this.interaccionService.preguntaAlert('Alerta', 
    '¿Reiniciar reporte de ventas?').then( res => {
        if (res) {
          this.ventaService.resetReport();
        }
    })
  }

}
