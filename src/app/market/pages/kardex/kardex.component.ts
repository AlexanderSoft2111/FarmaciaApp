import { Component, OnInit, ViewChild} from '@angular/core';
import { Paths, Producto, TransaccionProducto, InvProducto } from '../../../models/models';
import { FirestoreService } from '../../../services/firestore.service';
import { Router } from '@angular/router';
import { InteraccionService } from '../../../services/interaccion.service';
import { IonInput, PopoverController } from '@ionic/angular';
import { Subject} from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from '../../../../environments/environment';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FireAuthService } from '../../../services/fire-auth.service';
import { ModalDetalleComponent } from '../../componentes/modal-detalle/modal-detalle.component';


@Component({
  selector: 'app-kardex',
  templateUrl: './kardex.component.html',
  styleUrls: ['./kardex.component.scss'],
})
export class KardexComponent implements OnInit {



  codigoProducto = '';
  producto: Producto = null;
  invProducto: TransaccionProducto = null;
  titulo = 'Kardex';
  descripcion = 'Buscar artículo';
  debouncer: Subject<string> = new Subject();
  update: boolean = false;
  lastDocument: any;
  
  @ViewChild('codigo') codigoInput: IonInput;


  productos: TransaccionProducto[] = [];
  displayedColumns: string[] = ['fecha_transaccion','codigo','descripcion','lote','cantidad','um','precio_venta','total', 'detalle'];
  dataSource: MatTableDataSource<TransaccionProducto>;
  total = [];
  vendedor = true;
  uidAdmin = environment.uidAdmin;

 
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  fecha_creacion = new Date();
  cantidad: number = null;
  um: string = '';
  

  constructor(private firestoreService: FirestoreService,
              private popoverController: PopoverController,
              private interaccionService: InteraccionService,
              private fireAuthService: FireAuthService,
              private router: Router) { 
                this.permisos();

              }

  ngOnInit() {

    //Colocamos el foco en el input
      this.focusInputCodigo();
     
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



buscar(codigo: string) {

  if(codigo !== ''){

    const path = `${Paths.transacciones}${codigo}/Kardex`
  
    this.firestoreService. getCollectionOrderLimit<TransaccionProducto>(path,'fecha_transaccion','desc').subscribe( res => {
  
      if (res) {
        this.productos = res;
        this.productos.forEach(producto => {
          if(producto.tipo_transaccion === 'Egreso de stock'){
            producto.cantidad *= -1;
          }
        }); 
        this.dataSource = new MatTableDataSource(this.productos);
        setTimeout(() => {
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
             
            }, 300);    
      this.lastDocument = this.productos[this.productos.length - 1];
      } 
        else{
         return
        }
      }); 

      this.firestoreService.getDocumentChanges<InvProducto>(`${Paths.inventario}${codigo}`).subscribe( res => {
  
        if (res) {
          this.cantidad = res.cantidad;
          this.um = res.um;
          } else{
           return
          }
        });


  } else {
    this.interaccionService.showToast('Ingrese por favor el código a buscar');
    this.dataSource = null;
  }

}


  focusInputCodigo() {
      setTimeout( () => { 
        this.codigoInput.setFocus();
      }, 500); 
      
  }

  resetBusqueda(){
    this.codigoProducto = '';
    this.productos = null;
    this.dataSource = null;
    this.cantidad = null;
    this.um = '';
  }

  

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  async openModalVenta(transaccion: TransaccionProducto) {
    
     const modal = await this.popoverController.create({
        component: ModalDetalleComponent,
        componentProps: {
          transaccion,
          cantidad: this.cantidad,
          fecha: this.fecha_creacion
        },
        cssClass: 'popoverCssTransacciones',
        translucent: false,
        backdropDismiss: true,
        mode: 'ios'
    });
    await modal.present(); 
  }


}
