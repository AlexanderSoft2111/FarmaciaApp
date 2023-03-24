import { Component, OnDestroy, OnInit } from '@angular/core';
import {ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import {Clipboard} from '@angular/cdk/clipboard';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';

//Componentes de Ionic
import { PopoverController } from '@ionic/angular';

//Componentes
import { PopsetstockComponent } from '../../componentes/popsetstock/popsetstock.component';

//Angular Material Table
import {MatTableDataSource} from '@angular/material/table';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';

//Servicios
import { FirestoreService } from '../../../services/firestore.service';
import { InteraccionService } from '../../../services/interaccion.service';
import { FireAuthService } from '../../../services/fire-auth.service';

//Modelos - Interfaces
import { Paths, InvProducto, Producto } from '../../../models/models';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss'],
})
export class InventarioComponent implements OnInit, OnDestroy {

  productos: InvProducto[] = [];
  productosAgotados: InvProducto[] = [];
  productosCaducados: InvProducto[] = [];

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
  {campo: 'diferencia',label: 'Diferencia'},
  {campo: 'cantidadMinima',label: 'Cantidad Minima'},

];

  total = [];
  vendedor = true;
  uidAdmin = environment.uidAdmin;
  desubscribirnos: Subscription;
  cantidadMinima: number = 50;
  numeroFecha = 180;
 
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
        res.forEach(producto => {
          let fechaCaducada = new Date(producto.producto.fecha_caducidad);
          let hoy = new Date();
          let day_as_milliseconds = 86400000;
          let diff_in_millisenconds = Math.abs(fechaCaducada.getTime() - hoy.getTime());  
          let diff_in_days = diff_in_millisenconds / day_as_milliseconds;
          producto.diferencia = diff_in_days;
        });
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

  
  getProductosFiltro(tipoProducto: string){

    if(tipoProducto === 'agotados') {
      this.getAgotados(this.productos);
    } else if(tipoProducto === 'caducados') {
      this.getCaducados(this.productos);
    } else {

    }

  }

  getAgotados(productos: InvProducto[]) {
    this.productosAgotados = [];
    productos.forEach( producto => {

      if(producto.cantidad <= this.cantidadMinima){
        
         let existe = this.productosAgotados.find(({producto}) => {
           producto.codigo === producto.codigo;
        });

        if(existe === undefined){
          this.productosAgotados.push(producto);
          existe = null;
        }
      }
    });
    
    this.dataSource = new MatTableDataSource(this.productosAgotados);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }, 300);

  }

  getCaducados(productos: InvProducto[]) {
    this.productosCaducados = [];
    productos.forEach( producto => {
      
      if(producto.diferencia <= this.numeroFecha){
          let existe = this.productosCaducados.find(productoExiste => {
            return productoExiste.producto.codigo === producto.producto.codigo;    
          });
          if(existe === undefined){
            this.productosCaducados.push(producto);
            existe = null;
          }
      }

    });
    
    this.dataSource = new MatTableDataSource(this.productosCaducados);

    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
     
    }, 300);

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