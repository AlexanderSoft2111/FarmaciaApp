import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { Venta, Paths } from '../../../models/models';
import { Router } from '@angular/router';
import { FirestoreService } from '../../../services/firestore.service';
import { PopoverController } from '@ionic/angular';
import { DetalleFacturaComponent } from '../../componentes/detalle-factura/detalle-factura.component';

@Component({
  selector: 'app-facturas',
  templateUrl: './facturas.component.html',
  styleUrls: ['./facturas.component.scss'],
})


export class FacturasComponent implements OnInit {
    
  displayedColumns: string[] = ['Acciones','vendedor','numeroFactura' , 'fecha' ,'nombre', 'codCliente' ,'ruc', 'email','direccion','telefono', 'formaPago','detalle','total', ];
  dataSource: MatTableDataSource<Venta>;
  campos = [
    {campo: 'fecha'},
    {campo: 'vendedor'},
    {campo: 'ruc'},  
    {campo: 'codCliente'},  
    {campo: 'nombre'},
    {campo: 'email'},
    {campo: 'direccion'},
    {campo: 'telefono'},
    {campo: 'numeroFactura'},
    {campo: 'detalle'},
    {campo: 'formaPago'},
    {campo: 'total'},
];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  vendedor = true;
  desubscribirnos: Subscription;
  ventas: Venta[] = [];

  constructor(private route: Router,
              private firestoreService: FirestoreService,
              private popoverController: PopoverController) { }



  ngOnInit() {
    this.getFacturas();

  }

    
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filterPredicate = (data: Venta, filter: string) =>  {
      const nombre = data.cliente.nombre.toLowerCase().includes(filterValue);
      const ruc = data.cliente.ruc.includes(filterValue);
      return nombre || ruc
    };
   
    this.dataSource.filter = filterValue.trim();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    } 
  }

  getFacturas() {
    let fecha: any ;
    this.desubscribirnos = this.firestoreService.getCollection<Venta>(Paths.ventas).subscribe( res => {
 
       if (res) {

         this.ventas = res;
         this.ventas.forEach(venta => {
          fecha = venta.fecha;
          const {seconds} = fecha; //Para capturar la fecha de una marca de tiempo de firebase hay que desestructurar los segundos
          venta.fecha = new Date(seconds * 1000);//Luego los multiplicamos por mil para obtener la fecha exacta en un objeto Date
         });
         this.ventas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
         
         this.dataSource = new MatTableDataSource(this.ventas);
         
         setTimeout(() => {
           this.dataSource.paginator = this.paginator;
           this.dataSource.sort = this.sort;
           
         }, 300);
         } else{
           return
         }
       });
   }


   async openModalDetallNC(venta: Venta) {
    
    const modal = await this.popoverController.create({
       component: DetalleFacturaComponent,
       componentProps: {
         venta
       },
       cssClass: 'popoverCssTransacciones',
       translucent: false,
       backdropDismiss: true,
       mode: 'ios'
   });
   await modal.present(); 
 }

}
