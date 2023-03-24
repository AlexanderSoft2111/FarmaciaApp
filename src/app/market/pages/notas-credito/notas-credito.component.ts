import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';


//Angular Material
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { environment } from '../../../../environments/environment';
import { ModalController, PopoverController } from '@ionic/angular';
import { NotaCreditoComponent } from '../nota-credito/nota-credito.component';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirestoreService } from '../../../services/firestore.service';
import { NotaCredito, Paths } from '../../../models/models';
import { DetalleNotaCreditoComponent } from '../../componentes/detalle-nota-credito/detalle-nota-credito.component';

@Component({
  selector: 'app-notas-credito',
  templateUrl: './notas-credito.component.html',
  styleUrls: ['./notas-credito.component.scss'],
})
export class NotasCreditoComponent implements OnInit, OnDestroy {

  
  displayedColumns: string[] = ['Acciones','fecha', 'ruc', 'nombre', 'numeroNotaCredito', 'motivo', 'numeroFactura','total'];
  dataSource: MatTableDataSource<NotaCredito>;
  campos = [
    {campo: 'fecha'},
    {campo: 'ruc'},  
    {campo: 'nombre'},
    {campo: 'numeroNotaCredito'},
    {campo: 'motivo'},
    {campo: 'numeroFactura'},
    {campo: 'total'}
];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  vendedor = true;
  uidAdmin = environment.uidAdmin;
  desubscribirnos: Subscription;
  notasCredito: NotaCredito[] = [];


  constructor(private route: Router,
              private firestoreService: FirestoreService,
              private popoverController: PopoverController) { }
  
  ngOnDestroy() {
    this.desubscribirnos.unsubscribe();
  }

  ngOnInit() {
    this.getNotasCredito();

  }

  addNotaCredito() {
    this.route.navigateByUrl('/market/nota-credito');
  }

    
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filterPredicate = (data: NotaCredito, filter: string) =>  {
      const nombre = data.cliente.nombre.toLowerCase().includes(filterValue);
      const ruc = data.cliente.ruc.includes(filterValue);
      return nombre || ruc
    };
   
    this.dataSource.filter = filterValue.trim();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    } 
  }

  getNotasCredito() {
    let fecha: any ;
    this.desubscribirnos = this.firestoreService.getCollection<NotaCredito>(Paths.notasCredito).subscribe( res => {
 
       if (res) {

         this.notasCredito = res;
         this.notasCredito.forEach(notaCredito => {
          fecha = notaCredito.fecha;
          const {seconds} = fecha; //Para capturar la fecha de una marca de tiempo de firebase hay que desestructurar los segundos
          notaCredito.fecha = new Date(seconds * 1000);//Luego los multiplicamos por mil para obtener la fecha exacta en un objeto Date
         });
         this.dataSource = new MatTableDataSource(this.notasCredito);
         
         setTimeout(() => {
           this.dataSource.paginator = this.paginator;
           this.dataSource.sort = this.sort;
           
         }, 300);
         } else{
           return
         }
       });
   }

  
  async openModalDetallNC(notaCredito: NotaCredito) {
    
    const modal = await this.popoverController.create({
       component: DetalleNotaCreditoComponent,
       componentProps: {
         notaCredito
       },
       cssClass: 'popoverCssTransacciones',
       translucent: false,
       backdropDismiss: true,
       mode: 'ios'
   });
   await modal.present(); 
 }



}
