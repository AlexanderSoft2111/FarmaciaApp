import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { VentaService } from '../../../services/venta.service';
import { Cliente, Venta, Producto, Paths, ProductoVenta, InvProducto, TransaccionProducto } from '../../../models/models';
import { Subscription } from 'rxjs';
import { PopoverController } from '@ionic/angular';
import { FirestoreService } from '../../../services/firestore.service';
import { InteraccionService } from '../../../services/interaccion.service';
import { PopAddProductoComponent } from '../../componentes/pop-add-producto/pop-add-producto.component';
import { PopsetclientComponent } from '../../componentes/popsetclient/popsetclient.component';
import { jsPDF } from "jspdf";


@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.scss'],
})
export class VentaComponent implements OnInit, OnDestroy {

  venta: Venta;
  suscriberVenta: Subscription; 
  vuelto: number = 0;
  pago: number = 0;
  serie: string = '0';
  precioBonificacion: number = 0;
  precio_venta: number = 0;

  iva: boolean = false;
  detalle: string = '';

  encabezados = ['Boni','Código', 'Descripción','Lote', 'Stock', 'Cantidad', 'Precio', 'Total']
  
  constructor(private ventaService: VentaService,
              private firestoreService: FirestoreService,
              private interaccionService: InteraccionService,
              private popoverController: PopoverController) {
        console.log('constructor venta');
        this.venta = this.ventaService.getVenta();
        this.suscriberVenta = this.ventaService.getVentaChanges().subscribe( res => {
              this.venta = res;
              console.log('getVentaChanges -> ', res);
              this.addProducto();
              this.calcularValores();
              this.changePago();
              this.obtenerSerie();
              
              this.precio_venta = this.venta.productos[0].producto.producto.precio_venta;
        });
        this.addProducto();
        this.calcularValores();
  }

  ngOnInit() {}

  ngOnDestroy() {
    if (this.suscriberVenta) {
      this.suscriberVenta.unsubscribe();
    }
  }

  estado(index: number){
   console.log("this.isChecked",this.venta.productos[index].producto.producto.descuento);

   if(this.venta.productos[index].producto.producto.descuento !== false){
    this.venta.productos[index].producto.producto.precio_venta = this.precioBonificacion;
  } else {
    this.venta.productos[index].producto.producto.precio_venta = this.precio_venta;
  } 
  this.calcularValores();
   
  }

  obtenerSerie(){
    if(this.venta.numero < 10){
      this.serie = '000000'
    } else if (this.venta.numero < 100) {
      this.serie = '00000'
    } else if (this.venta.numero < 1000) {
      this.serie = '0000'
    } else if (this.venta.numero < 10000) {
      this.serie = '000'
    }
    else if (this.venta.numero < 100000) {
      this.serie = '00'
    }  
    else if (this.venta.numero < 1000000) {
      this.serie = '0'
    }  
  }

  async setCliente() {
      const popover = await this.popoverController.create({
        component: PopsetclientComponent,
        cssClass: 'popoverCssCliente',
        translucent: false,
        backdropDismiss: true,
        componentProps: {venta: true},
        mode: 'ios'
      });
     await popover.present();
     const { data } = await popover.onWillDismiss();
     if (data) {
       console.log(data);
       const cliente = data.cliente;
       this.venta.cliente = cliente;
       this.ventaService.saveVenta();
     }
  }

  addProducto() {
    if (this.venta) {
      const productoVenta = {
        cantidad: 1,
        precio: 0,
        producto: {
          cantidad: 0,
          um: 'CJ',
          fecha_ingreso: new Date(),
          producto: {
            codigo: '',
            descripcion: '',
            lote: '',
            precio_compra: 0,
            precio_venta: 0,
            descuento: false,
            fecha_caducidad: new Date(),
            fecha_elaboracion: new Date(),
            fecha_creacion: new Date()
          },
          detalle: ''
        },
      }

      console.log('this.venta ----->',productoVenta);
       if (!this.venta.productos.length) {
          this.venta.productos.push(productoVenta);
      } else {
          if (this.venta.productos[this.venta.productos.length - 1].producto.producto.codigo.length) {
              this.venta.productos.push(productoVenta);
          }  
      } 

    }
    this.setFocusNewProducto();
  }

  changeCodigo(ev: any, index: number) {
      console.log('changeCodigo() -> ', ev.detail.value);
      if (ev.detail.value.length > 2) {
        this.findProducto(ev.detail.value, index);
      }
  }

  findProducto(id: string, index: number) {
    const path = Paths.inventario + id;
    console.log('este es el path ',path);
    this.firestoreService.getDocumentFromCache<InvProducto>(path).then( res => {
        if (res) {
            this.addProductoWithCode(res, index)
        } else {
           console.log('no existe producto');
        }
    })
  }

  setFocusNewProducto() {
        setTimeout(() => {
          const inputs = document.getElementsByClassName("codigo") as any;
 
          if (inputs.length) {
            inputs[inputs.length -1].setFocus();
          }
        }, 500);
  }

  clearInput() {
      this.venta.productos[this.venta.productos.length - 1].producto.producto.codigo = '';
      this.setFocusNewProducto();
  }

  // Añade un producto a la venta con el codigo escaneado
  // Aumenta la cantidad del producto si al escanear es el mismo producto
  // que ya existe
  addProductoWithCode(newproducto: InvProducto, index: number) {
      const productoExist = this.venta.productos.find( producto => {
        console.log('consulta de producto',producto)
             return  producto.producto.producto.codigo === newproducto.producto.codigo;
      });
      console.log('productoExist  -> ', productoExist );

      this.venta.productos[index].producto = newproducto;
          this.ventaService.saveVenta();
          this.addProducto();
  }


  addCantidad(producto: ProductoVenta) {
    producto.cantidad ++;
    this.ventaService.saveVenta();
  }

  removeCantidad(producto: ProductoVenta) {
      if (producto.cantidad) {
        producto.cantidad --;
        this.ventaService.saveVenta();
      }
  }

  changeCantidad(producto: ProductoVenta, index: number) {
      if (producto.cantidad === 0) {
          this.venta.productos.splice(index, 1);
          this.ventaService.saveVenta();
          return;
        }
        this.calcularValores();
      producto.precio = producto.cantidad * producto.producto.producto.precio_venta;

  }

  calcularValores() {
      if (this.venta) {
        this.venta.total = 0;
        this.venta.subtotal_con_iva = 0;
        this.venta.subtotal_sin_iva = 0;
        this.venta.iva = 0;
        this.venta.productos.forEach( item => {
              item.precio = item.cantidad * item.producto.producto.precio_venta;
              this.venta.total = this.venta.total + item.precio;
              
                this.venta.subtotal_sin_iva = this.venta.subtotal_sin_iva + item.precio;
              
        });
      }
  }

  // AGREGA UN NUEVO PRODUCTO DE VENTA RAPIDAMENTE
/*   async addProductoRapido() {
    const popover = await this.popoverController.create({
      component: PopAddProductoComponent,
      cssClass: 'popoverCss',
      translucent: false,
      backdropDismiss: true,
      mode: 'ios'
    });
    await popover.present();
    const { data } = await popover.onWillDismiss();
    if (data) {
      const producto = data as InvProducto;
      console.log('data -> ', data);
      const item: ProductoVenta = {
          cantidad: 1,
          precio: producto.producto.precio_venta,
          producto,
      }
      if (!this.venta.productos[this.venta.productos.length - 1].producto.producto.codigo) {
        this.venta.productos[this.venta.productos.length - 1] =  item;
      } else {
        this.venta.productos.push(item);
      }
      this.ventaService.saveVenta();
      this.addProducto();
    }

} */

  resetVenta() {
     this.interaccionService.preguntaAlert('Alerta', 
            '¿Seguro que desea resetear la venta actual?').then( res => {
                if (res) {
                  this.ventaService.resetVenta();
                }
            })
  }

  changePago() {
      if (this.pago >= this.venta.total) {
            this.vuelto = this.pago - this.venta.total;
      } else {
        this.vuelto = 0;
      }
  }

  saveVenta() {
    if (!this.venta.total) {
      this.interaccionService.showToast('No se ha registrado ningún producto');
      return;
    };

    if (this.venta.cliente.nombre === '') {
      this.interaccionService.showToast('Debe ingresar los datos del cliente');
      return;
    }
    
    this.interaccionService.preguntaAlert('Alerta', 
    '¿Terminar y guardar la venta actual?').then( res => {
        if (res) {
            this.venta.detalle = this.detalle;
            console.log('finalizar venta');
            if (this.pago >= this.venta.total) {
              this.venta.productos.forEach(item => {

                if(item.producto.producto.codigo !== ''){

                  const transproducto: TransaccionProducto = {
                    numero_factura: this.serie + this.venta.numero,
                    proveedor: this.venta.cliente.nombre,
                    ruc: this.venta.cliente.ruc,
                    cantidad: item.cantidad,
                    um: item.producto.um,
                    producto: item.producto.producto,
                    fecha_transaccion: new Date(),
                    tipo_transaccion: 'Egreso de stock'
                  };
                  
                  console.log('producto guardado ',transproducto);
                  
                  const path = `${Paths.transacciones}${item.producto.producto.codigo}/Kardex`;
                  this.firestoreService.createDocument<TransaccionProducto>(transproducto, path);  
                } else { return}
                
              });
              this.ventaService.saveVentaTerminada();
              this.pago = 0;
              this.vuelto = 0;
            } else {
              console.log('El valor pagado es menor el total de la vental');
              this.interaccionService.showToast('El valor pagado es menor el total de la venta', 3000);
            }
        }
    });
  }

  calcularIva(){
    if(!this.iva){
      this.venta.iva = this.venta.total * 0.12;
      this.venta.total += this.venta.iva;
    } else{
      this.venta.total -= this.venta.iva;
      this.venta.iva = 0;
    }
  }

  guardarPDF(){

    // Landscape export, 2×4 inches
  const doc = new jsPDF();
  
  doc.setFontSize(10);
  doc.text("Cliente", 11, 42);    doc.text(this.venta.cliente.nombre, 25, 42);      doc.text("Ruc", 145, 42);    doc.text(this.venta.cliente.ruc, 157, 42);
  doc.text("Fecha", 11, 48);      doc.text('11/10/2021', 25, 48);                   doc.text("Telf", 117, 48);    doc.text(this.venta.cliente.telefono, 128, 48);
  doc.text("Dirección", 11, 54);  doc.text(this.venta.cliente.direccion, 30, 54);
  doc.text("Email", 11, 60);      doc.text(this.venta.cliente.email, 25, 60);
  doc.text("CANT.", 18, 68);      doc.text("DESCRIPCION", 55, 68);   doc.text("V.UNIT.", 166, 68);  doc.text("V.TOTAL", 188, 68);
  
  let positionX = 74;
  this.venta.productos.forEach(producto => {
      if(producto.producto.producto.codigo !== ''){

        doc.text( producto.cantidad.toLocaleString(), 15, positionX);
        doc.text( producto.producto.producto.descripcion, 35, positionX);
        doc.text( producto.producto.producto.precio_venta.toLocaleString(), 160, positionX);
        doc.text( producto.precio.toLocaleString(), 185, positionX);
        positionX += 6;
      } 
      else { return}
  });
  positionX = 74;

  doc.text("SUBTOTAL $", 161, 120);     doc.text(this.venta.subtotal_sin_iva.toFixed(2), 185, 120);
  doc.text("DESCUENTO $", 158, 126);         
  doc.text("I.V.A 0 % $", 161, 132);    
  doc.text("I.V.A % $", 159, 138);      doc.text(this.venta.iva.toFixed(2), 185, 138);
  doc.text("TOTAL % $", 166, 144);      doc.text(this.venta.total.toFixed(2), 185, 144);

  doc.text('Otros', 12, 135); doc.text(this.detalle, 37, 135);
  doc.save(`Factura_${this.serie}${this.venta.numero}.pdf`);
  }

}
