import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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

  //Formulario datos del clientes
  miFormulario: UntypedFormGroup = this.fb.group({
    nombre: ['', Validators.required],
    ruc: ['', Validators.required],
    direccion: ['', Validators.required],
    telefono: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    codCliente: ['', Validators.required]
  });

  //Enviamos la venta para saber desde donde se llama la pantalla
  @Input() venta: boolean = false;

  //Recibimos el cliente desde el modal
  @Input() newcliente: Cliente;

  cliente: Cliente = null;
  rucCliente = '';
  titulo = 'Nuevo Cliente';
  update = false;
  checkSave = {
    color: 'dark',
    selected: false
  }

  constructor(private fb: UntypedFormBuilder,
              private popoverController:PopoverController,
              private toastCtrl: ToastController,
              private firestoreService: FirestoreService,
              private interaccionService: InteraccionService) { }

  ngOnInit() {
    if(this.newcliente !== undefined){
      this.update = true;
      this.recibirCliente();
    }
  }
  
  onClick(check: any){
    console.log(check);
  }
  
  aceptar() {
    this.popoverController.dismiss({
      cliente: this.cliente,      
    });
  }

  cancelar(){
    this.popoverController.dismiss();
  }

  campoNoValido(campo: string){
    return  this.miFormulario.controls[campo].errors &&
            this.miFormulario.controls[campo].touched;
  }

  changeCodigo() {
    if(this.rucCliente !== null){
      if(this.rucCliente.length >=10){
        this.miFormulario.controls['ruc'].setValue(this.rucCliente);
        this.findProducto();
      }
    }
  }

  close() {
    this.popoverController.dismiss();
  }


  findProducto() {
    const path = Paths.clientes;
    this.firestoreService.getCollectionQuery<Cliente>(path,'ruc',this.rucCliente).subscribe(res => {
        if (res.length > 0) {
            this.update = true;
            this.titulo = 'Editar Cliente';
            this.cliente = res[0];
            this.miFormulario.controls['nombre'].setValue(this.cliente.nombre);
            this.miFormulario.controls['ruc'].setValue(this.cliente.ruc);
            this.miFormulario.controls['direccion'].setValue(this.cliente.direccion);
            this.miFormulario.controls['telefono'].setValue(this.cliente.telefono);
            this.miFormulario.controls['email'].setValue(this.cliente.email);
            this.miFormulario.controls['codCliente'].setValue(this.cliente.codCliente);
          } else {
            this.update = false;
            this.cliente = null;
            this.titulo = 'Nuevo Cliente';
            this.miFormulario.controls['nombre'].setValue('');
            this.miFormulario.controls['direccion'].setValue('');
            this.miFormulario.controls['telefono'].setValue('');
            this.miFormulario.controls['email'].setValue('');
            this.miFormulario.controls['codCliente'].setValue('');
        }
    }); 
  }

  guardar(){
    if(this.miFormulario.invalid){
      this.miFormulario.markAllAsTouched();
    }else{

      const newCliente: Cliente = {
        id: this.firestoreService.createIdDoc(),
        nombre: this.miFormulario.controls['nombre'].value,
        ruc: this.miFormulario.controls['ruc'].value,
        direccion: this.miFormulario.controls['direccion'].value,
        telefono: this.miFormulario.controls['telefono'].value,
        email: this.miFormulario.controls['email'].value,
        codCliente: this.miFormulario.controls['codCliente'].value
      };

      const path = Paths.clientes;
      this.firestoreService.createDocumentID<Cliente>(newCliente, path,newCliente.id).then( res => {
            this.interaccionService.showToast('Guardado con éxito');
            this.miFormulario.reset();
            this.popoverController.dismiss({
              cliente: newCliente,      
            });  
      });      
    }
  }

  recibirCliente(){
    this.rucCliente = this.newcliente.ruc;
    this.miFormulario.controls['nombre'].setValue(this.newcliente.nombre);
    this.miFormulario.controls['ruc'].setValue(this.newcliente.ruc);
    this.miFormulario.controls['direccion'].setValue(this.newcliente.direccion);
    this.miFormulario.controls['telefono'].setValue(this.newcliente.telefono);
    this.miFormulario.controls['email'].setValue(this.newcliente.email);
    this.miFormulario.controls['codCliente'].setValue(this.newcliente.codCliente);
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

updateClient() {
    const path = Paths.clientes;
    const updateDoc = {
      nombre: this.miFormulario.controls['nombre'].value,
      ruc: this.miFormulario.controls['ruc'].value,
      direccion: this.miFormulario.controls['direccion'].value,
      telefono: this.miFormulario.controls['telefono'].value,
      email: this.miFormulario.controls['email'].value,
      codCliente: this.miFormulario.controls['codCliente'].value,
    }

    this.firestoreService.updateDocumentID(updateDoc, path, this.newcliente.id).then( () => {
          this.interaccionService.showToast('Actualizado con éxito');
    });

    this.popoverController.dismiss({
      cliente: updateDoc,      
    });
  }
}
