import { Component, OnDestroy, OnInit } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { Paths, InvProducto } from '../../../models/models';

import {ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { PopoverController } from '@ionic/angular';
import { PopsetstockComponent } from '../../componentes/popsetstock/popsetstock.component';
import { InteraccionService } from '../../../services/interaccion.service';

import {Clipboard} from '@angular/cdk/clipboard';
import { FireAuthService } from '../../../services/fire-auth.service';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss'],
})
export class InventarioComponent implements OnInit, OnDestroy {

  productos: InvProducto[] = [];
  displayedColumns: string[] = ['Acciones','codigo','descripcion','lote','cantidad','um','precio_venta','total','fecha_caducidad'];
  dataSource: MatTableDataSource<InvProducto>;
  campos = [
  {campo: 'codigo',label: 'Código'},  
  {campo: 'descripcion',label: 'Descripción'},  
  {campo: 'lote',label: 'Lote'},
  {campo: 'cantidad',label: 'Cantidad'},   
  {campo: 'um',label: 'UM'}, 
  {campo: 'precio_venta',label: 'Precio Venta'},  
  {campo: 'total',label: 'Total'},  
  {campo: 'fecha_caducidad',label: 'Fecha de Caducidad'},

];

  total = [];
  vendedor = true;
  uidAdmin = environment.uidAdmin;
  desubscribirnos: Subscription;
 
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  

  constructor(private firestoreService: FirestoreService,
              private popoverController: PopoverController,
              private interaccionService: InteraccionService,
              private clipboard: Clipboard,
              private fireAuthService: FireAuthService,
              private router: Router) { }

  ngOnInit() {

    this.permisos();
    
    
  }
  ngOnDestroy(){
    this.desubscribirnos.unsubscribe();
  }


  permisos(){
    this.fireAuthService.stateAuth().subscribe( res => {
        if(res !== null){
          if (res.uid === this.uidAdmin){
                this.vendedor = false;
          }
          
        } else{
          this.fireAuthService.logout();
          this.router.navigate(['/market/login']);
        }
    });
  }

  ionViewWillEnter() {
      this.getProductos();
  }

  getProductos() {

   this.desubscribirnos = this.firestoreService.getCollection<InvProducto>(Paths.inventario).subscribe( res => {

      if (res) {
        this.productos = res;
            this.dataSource = new MatTableDataSource(this.productos);
            setTimeout(() => {
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
             
            }, 300);
        } else{
          return
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

  async setStock(producto: InvProducto) {
    if(!this.vendedor){
      const popover = await this.popoverController.create({
        component: PopsetstockComponent,
        cssClass: 'popoverCssCliente',
        translucent: false,
        backdropDismiss: true,
        componentProps: {producto},
        mode: 'ios'
      });
      await popover.present();
      const { data } = await popover.onWillDismiss();
      
    } return;
  }


  copyCodigo(ev: any) {
    this.interaccionService.showToast('Código copiado: ' + ev.codigo);
    this.clipboard.copy(ev.codigo)

  }

  delete(invproducto: InvProducto) {

    this.interaccionService.preguntaAlert('Alerta', 
    `¿Seguro que desea eliminar ${invproducto.producto.descripcion}?`).then( res => {
        if (res) {
          this.firestoreService.deleteDocumentID(Paths.productos, invproducto.producto.codigo);
          this.firestoreService.deleteDocumentID(Paths.inventario, invproducto.producto.codigo);
          this.getProductos();
        }
    })
  }


}