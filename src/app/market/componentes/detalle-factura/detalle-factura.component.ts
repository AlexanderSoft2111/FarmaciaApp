import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { MatTableDataSource } from '@angular/material/table';
import { Venta, ProductoVenta } from '../../../models/models';

@Component({
  selector: 'app-detalle-factura',
  templateUrl: './detalle-factura.component.html',
  styleUrls: ['./detalle-factura.component.scss'],
})
export class DetalleFacturaComponent implements OnInit {

  @Input() venta: Venta;

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
    console.log(this.venta);
    this.dataSource = new MatTableDataSource(this.venta.productos);
  }

  
  closeModal() {
    this.popoverController.dismiss();
  }

}
