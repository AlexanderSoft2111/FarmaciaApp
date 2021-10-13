import { Component, OnInit, ViewChild } from '@angular/core';
import { Paths, Cliente } from '../../../models/models';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FirestoreService } from '../../../services/firestore.service';
import { PopoverController } from '@ionic/angular';
import { PopsetclientComponent } from '../../componentes/popsetclient/popsetclient.component';
import { FireAuthService } from '../../../services/fire-auth.service';
import { environment } from '../../../../environments/environment';
import { InteraccionService } from '../../../services/interaccion.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  displayedColumns: string[] = ['editar', 'ruc', 'nombre', 
                                'direccion', 
                                'telefono', 'email'];
  dataSource: MatTableDataSource<Cliente>;
  campos = [{campo: 'ruc',label: 'Cédula o Ruc'}, 
            {campo: 'nombre',label: 'Nombre'},  
            {campo: 'direccion',label: 'Dirección'},
            {campo: 'telefono',label: 'Teléfono'},  
            {campo: 'email',label: 'Email'}
  ]

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  vendedor = true;
  uidAdmin = environment.uidAdmin;

  

  constructor(private firestoreService: FirestoreService,
              private popoverController: PopoverController,
              private fireAuthService: FireAuthService,
              private interaccionService: InteraccionService) { }

  ngOnInit() {
    this.permisos();
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

  ionViewWillEnter() {
      this.getClientes();
  }

  getClientes() {
      this.firestoreService.getCollectionFromCache<Cliente>(Paths.clientes).then( res => {
        console.log('res Collection -> ', res);
        if (res) {
            this.clientes = res;
            this.dataSource = new MatTableDataSource(this.clientes);
            setTimeout(() => {
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            }, 300);
        } 
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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
      console.log(data);
      this.getClientes();

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
     this.getClientes();
     console.log(data);
  }

  delete(cliente: Cliente) {
      this.interaccionService.preguntaAlert('Alerta', 
      '¿Seguro que desea eliminar?').then( res => {
          if (res) {
            const path = Paths.clientes;
            this.firestoreService.deleteDocumentID(path, cliente.ruc);
            this.getClientes();
          }
      })
  }



}
