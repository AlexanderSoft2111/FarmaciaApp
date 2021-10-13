import { Component, Input, OnInit } from '@angular/core';
import { PopoverController, ToastController } from '@ionic/angular';
import { Paths, InvProducto, TransaccionProducto } from '../../../models/models';
import { FirestoreService } from '../../../services/firestore.service';
import { InteraccionService } from '../../../services/interaccion.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-popsetstock',
  templateUrl: './popsetstock.component.html',
  styleUrls: ['./popsetstock.component.scss'],
})
export class PopsetstockComponent implements OnInit {

  miFormulario: FormGroup = this.fb.group({
    numero_factura: [null, Validators.required],
    proveedor: [null, Validators.required],
    ruc: [null, Validators.required],
    cantidad: [null, Validators.required],
    um: [{value: 'CJ', disabled: true}, Validators.required],
    
  });

  invProducto: InvProducto = {
    cantidad: null,
    um: 'CJ',
    producto: null,
    fecha_ingreso: new Date()
  }
  @Input() producto: InvProducto;
  @Input() venta: boolean = false;

  
  cantidad = null;
  titulo = 'Ingresar Cantidad';


  codigo = '';

  constructor(private firestoreService: FirestoreService,
              private interaccionService: InteraccionService,
              private popoverController: PopoverController,
              private fb: FormBuilder,
              private toastCtrl: ToastController) { }

  ngOnInit() {

          this.recibirProducto();

  }

  saveCantidad() {
    const path = Paths.productos;
    const updateDoc = {
      cantidad: this.cantidad
    }
    this.firestoreService.updateDocumentID(updateDoc, path, this.invProducto.producto.codigo).then( res => {
           this.interaccionService.showToast('Guardado con éxito');
    });
    this.popoverController.dismiss();
  } 

  cancelar() {
      this.popoverController.dismiss();
  } 



  recibirProducto(){
    this.invProducto.producto = this.producto.producto;
  }

  campoNoValido(campo: string){
    return  this.miFormulario.controls[campo].errors &&
            this.miFormulario.controls[campo].touched;
  }

  guardar(){
    if(this.miFormulario.invalid){
      this.miFormulario.markAllAsTouched();
    } else{
      const transproducto: TransaccionProducto = {
        numero_factura: this.miFormulario.controls['numero_factura'].value,
        proveedor: this.miFormulario.controls['proveedor'].value,
        ruc: this.miFormulario.controls['ruc'].value,
        cantidad: this.miFormulario.controls['cantidad'].value,
        um: this.miFormulario.controls['um'].value,
        producto: this.producto.producto,
        fecha_transaccion: new Date(),
        tipo_transaccion: 'Ingreso de stock'
      };

      const invProducto: InvProducto = {
        cantidad: this.miFormulario.controls['cantidad'].value + this.producto.cantidad,
        um: this.miFormulario.controls['um'].value,
        producto: this.producto.producto,
        fecha_ingreso: new Date()
      };
      

      
      const path = `${Paths.transacciones}${this.producto.producto.codigo}/Kardex`;
        this.firestoreService.createDocument<TransaccionProducto>(transproducto, path).then( res => {
              this.interaccionService.showToast('Guardado con éxito');
              this.miFormulario.reset();
              this.popoverController.dismiss({
                producto: transproducto   
              });        
       }); 
      
        this.firestoreService.updateDocumentID<InvProducto>(invProducto, Paths.inventario, this.invProducto.producto.codigo).then( res => {
              this.interaccionService.showToast('Guardado con éxito');
              this.miFormulario.reset();
              this.popoverController.dismiss({
                producto: invProducto   
              });        
       }); 
      

    }
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1000,
      position: 'bottom',
      cssClass: 'aviso',
    });
    toast.present();
  }


/*   changeCodigo() {
    if(this.rucCliente !== null){
      if(this.rucCliente.length >=10){
        this.miFormulario.controls['ruc'].setValue(this.rucCliente);
        this.findProducto(this.rucCliente);
      }
    }
    
 } */

  findProducto(id: string) {
    const path = Paths.clientes + id;
    /* this.firestoreService.getDocumentFromCache<Cliente>(path).then( res => {
        if (res) {
            this.titulo = 'Editar Cliente';
            this.cliente = res;
            this.miFormulario.controls['nombre'].setValue(this.cliente.nombre);
            this.miFormulario.controls['ruc'].setValue(this.cliente.ruc);
            this.miFormulario.controls['direccion'].setValue(this.cliente.direccion);
            this.miFormulario.controls['telefono'].setValue(this.cliente.telefono);
            this.miFormulario.controls['email'].setValue(this.cliente.email);
        } else {
           console.log('no existe producto');
           this.cliente = null;
           this.titulo = 'Nuevo Cliente';
           this.miFormulario.controls['nombre'].setValue('');
           this.miFormulario.controls['direccion'].setValue('');
           this.miFormulario.controls['telefono'].setValue('');
           this.miFormulario.controls['email'].setValue('');
        }
    }) */
}

updateClient() {
    const path = Paths.clientes;
    const updateDoc = {
      nombre: this.miFormulario.controls['nombre'].value,
      ruc: this.miFormulario.controls['ruc'].value,
      direccion: this.miFormulario.controls['direccion'].value,
      telefono: this.miFormulario.controls['telefono'].value,
      email: this.miFormulario.controls['email'].value,
    }
    this.firestoreService.updateDocumentID(updateDoc, path, updateDoc.ruc).then( res => {
          this.interaccionService.showToast('Guardado con éxito');
    });
    this.popoverController.dismiss({
      cliente: updateDoc,      
    });
  }

  close() {
    this.popoverController.dismiss();
  }

  aceptar() {
    this.popoverController.dismiss({
     /*  cliente: this.cliente,     */  
    });
  }

}
