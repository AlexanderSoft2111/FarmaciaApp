import { Component, Input, OnInit } from '@angular/core';
import { NotaCredito, ProductoVenta } from '../../../models/models';
import { PopoverController } from '@ionic/angular';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-detalle-nota-credito',
  templateUrl: './detalle-nota-credito.component.html',
  styleUrls: ['./detalle-nota-credito.component.scss'],
})
export class DetalleNotaCreditoComponent implements OnInit {
  @Input() notaCredito: NotaCredito;

  displayedColumns: string[] = ['codigo','descripcion','lote','cantidad','um','precio_unitario','descuento','total'];
  dataSource: MatTableDataSource<ProductoVenta>;
  campos = [
    {campo: 'codigo',label: 'Código'},  
    {campo: 'descripcion',label: 'Descripción'},  
    {campo: 'lote',label: 'Lote'},
    {campo: 'cantidad',label: 'Cantidad'},   
    {campo: 'um',label: 'UM'}, 
    {campo: 'precio_unitario',label: 'Precio Unitario'},  
    {campo: 'descuento',label: 'Descuento'},  
    {campo: 'total',label: 'Total'},  
  ];

  constructor(private popoverController: PopoverController) { }

  ngOnInit() {
    console.log(this.notaCredito);
    this.dataSource = new MatTableDataSource(this.notaCredito.productos);
  }

  
  closeModal() {
    this.popoverController.dismiss();
  }

}
