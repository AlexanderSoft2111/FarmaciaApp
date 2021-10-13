import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopoverController, ToastController } from '@ionic/angular';
import { Cliente, Paths } from '../../../models/models';
import { FirestoreService } from '../../../services/firestore.service';
import { InteraccionService } from '../../../services/interaccion.service';

@Component({
  selector: 'app-popsetclient',
  templateUrl: './popsetclient.component.html',
  styleUrls: ['./popsetclient.component.scss'],
})
export class PopsetclientComponent implements OnInit {



  miFormulario: FormGroup = this.fb.group({
    nombre: ['', Validators.required],
    ruc: ['', Validators.required],
    direccion: ['', Validators.required],
    telefono: ['', Validators.required],
    email: [''],
    
  });

  @Input() venta: boolean = false;
  @Input() newcliente: Cliente;
  cliente: Cliente = null;
  rucCliente = '';
  titulo = 'Nuevo Cliente';
  update = false;

  constructor(private fb: FormBuilder,
              private popoverController:PopoverController,
              private toastCtrl: ToastController,
              private firestoreService: FirestoreService,
              private interaccionService: InteraccionService) { }

  ngOnInit() {
    if(this.newcliente !== undefined){
      this.recibirCliente();
    }
  }

  recibirCliente(){
    console.log(this.newcliente);
    this.update = true;
    this.rucCliente = this.newcliente.ruc;
    this.miFormulario.controls['nombre'].setValue(this.newcliente.nombre);
    this.miFormulario.controls['ruc'].setValue(this.newcliente.ruc);
    this.miFormulario.controls['direccion'].setValue(this.newcliente.direccion);
    this.miFormulario.controls['telefono'].setValue(this.newcliente.telefono);
    this.miFormulario.controls['email'].setValue(this.newcliente.email);
  }

  campoNoValido(campo: string){
    return  this.miFormulario.controls[campo].errors &&
            this.miFormulario.controls[campo].touched;
  }

  guardar(){
    if(this.miFormulario.invalid){
      this.miFormulario.markAllAsTouched();
    } else{
      const newCliente: Cliente = {
        nombre: this.miFormulario.controls['nombre'].value,
        ruc: this.miFormulario.controls['ruc'].value,
        direccion: this.miFormulario.controls['direccion'].value,
        telefono: this.miFormulario.controls['telefono'].value,
        email: this.miFormulario.controls['email'].value,
      };

      this.interaccionService.showToast('Agregado con éxito');
             this.miFormulario.reset();
             this.popoverController.dismiss({
               cliente: newCliente,      
             }); 

    /* Agregar clientes en la base de datos
     const path = Paths.clientes;
       this.firestoreService.createDocumentID<Cliente>(newCliente, path, newCliente.ruc).then( res => {
             this.interaccionService.showToast('Guardado con éxito');
             this.miFormulario.reset();
             this.popoverController.dismiss({
               cliente: newCliente,      
             });        
      }); */
      

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

  cancelar(){
    this.popoverController.dismiss();
  }

  changeCodigo() {
    if(this.rucCliente !== null){
      if(this.rucCliente.length >=10){
        this.miFormulario.controls['ruc'].setValue(this.rucCliente);
        this.findProducto(this.rucCliente);
      }
    }
    
 }

  findProducto(id: string) {
    const path = Paths.clientes + id;
    this.firestoreService.getDocumentFromCache<Cliente>(path).then( res => {
        if (res) {
            this.update = true;
            this.titulo = 'Editar Cliente';
            this.cliente = res;
            this.miFormulario.controls['nombre'].setValue(this.cliente.nombre);
            this.miFormulario.controls['ruc'].setValue(this.cliente.ruc);
            this.miFormulario.controls['direccion'].setValue(this.cliente.direccion);
            this.miFormulario.controls['telefono'].setValue(this.cliente.telefono);
            this.miFormulario.controls['email'].setValue(this.cliente.email);
        } else {
           console.log('no existe producto');
           this.update = false;
           this.cliente = null;
           this.titulo = 'Nuevo Cliente';
           this.miFormulario.controls['nombre'].setValue('');
           this.miFormulario.controls['direccion'].setValue('');
           this.miFormulario.controls['telefono'].setValue('');
           this.miFormulario.controls['email'].setValue('');
        }
    })
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
    console.log(updateDoc);
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
      cliente: this.cliente,      
    });
  }

}
