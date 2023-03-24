import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Paths, Cliente } from '../../../models/models';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import {Clipboard} from '@angular/cdk/clipboard';


//Componentes
import { PopsetclientComponent } from '../../componentes/popsetclient/popsetclient.component';

//Servicios
import { FireAuthService } from '../../../services/fire-auth.service';
import { FirestoreService } from '../../../services/firestore.service';
import { InteraccionService } from '../../../services/interaccion.service';

//Angular Material
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';



@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
})
export class ClientesComponent implements OnInit {
  
  clientes: Cliente[] = [];

  //Columnas para la tabla
  displayedColumns: string[] = 
  ['editar', 'ruc', 'codCliente', 'nombre', 'direccion', 'telefono', 'email'];

  dataSource: MatTableDataSource<Cliente>;

  campos = [{campo: 'ruc',label: 'Cédula o Ruc'}, 
            {campo: 'codCliente',label: 'Código'},  
            {campo: 'nombre',label: 'Nombre'},  
            {campo: 'direccion',label: 'Dirección'},
            {campo: 'telefono',label: 'Teléfono'},  
            {campo: 'email',label: 'Email'}
  ]

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  vendedor = true;
  uidAdmin = environment.uidAdmin;
  desubscribirnos: Subscription;

  constructor(private firestoreService: FirestoreService,
              private popoverController: PopoverController,
              private fireAuthService: FireAuthService,
              private interaccionService: InteraccionService,
              private clipboard: Clipboard) { }

  ngOnInit() {
    this.permisos();
    if(this.clientes.length === 0){
      this.getClientes();
    }
  }
  



  ngOnDestroy(){
    this.desubscribirnos.unsubscribe();

    
  }

  async addCliente(){
    const popover = await this.popoverController.create({
      component: PopsetclientComponent,
      cssClass: 'popoverCssCliente',
      translucent: false,
      backdropDismiss: true,
      mode: 'ios'
    });
     await popover.present();
     const { data } = await popover.onWillDismiss();
  }
  
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  copyCodigo(ev: any) {
    this.interaccionService.showToast('Código copiado: ' + ev);
    this.clipboard.copy(ev)

  }

  delete(cliente: Cliente) {
    this.interaccionService.preguntaAlert('Alerta', 
    '¿Seguro que desea eliminar?').then( res => {
        if (res) {
          const path = Paths.clientes;
          this.firestoreService.deleteDocumentID(path, cliente.id);
        }
    })
  }

  getClientes() {
    this.desubscribirnos = this.firestoreService.getCollection<Cliente>(Paths.clientes).subscribe( res => {
      if (res) {
        this.clientes = res;
            this.dataSource = new MatTableDataSource(this.clientes);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        } else{
          return
        }
    });
  }
  
  //Cambiamos la variable de vendedor a false para que tenga todos los permisos de administrador
  permisos(){
    this.fireAuthService.stateAuth().subscribe( res => { 
      if(res !== null){
          if (res.uid === this.uidAdmin){
            this.vendedor = false;
          }
      }  
    }); 
  }

  async setClient(newcliente: Cliente) {
      const popover = await this.popoverController.create({
        component: PopsetclientComponent,
        cssClass: 'popoverCssCliente',
        translucent: false,
        backdropDismiss: true,
        componentProps: {newcliente},
        mode: 'ios'
      });
      await popover.present();
      const { data } = await popover.onWillDismiss();
  }

}
