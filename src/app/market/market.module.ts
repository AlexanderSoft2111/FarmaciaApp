import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { IonicModule } from '@ionic/angular';
import { MatTableExporterModule } from 'mat-table-exporter';

import { AddinventarioComponent } from './pages/addinventario/addinventario.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { MarketRoutingModule } from './market-routing.module';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { VentaComponent } from './pages/venta/venta.component';
import { PopsetstockComponent } from './componentes/popsetstock/popsetstock.component';
import { PopsetclientComponent } from './componentes/popsetclient/popsetclient.component';
import { LoginComponent } from './pages/login/login.component';
import { KardexComponent } from './pages/kardex/kardex.component';
import { ModalDetalleComponent } from './componentes/modal-detalle/modal-detalle.component';

import { NgxBarcodeModule } from 'ngx-barcode';
import { NotasCreditoComponent } from './pages/notas-credito/notas-credito.component';
import { NotaCreditoComponent } from './pages/nota-credito/nota-credito.component';
import { FacturasComponent } from './pages/facturas/facturas.component';
import { DetalleFacturaComponent } from './componentes/detalle-factura/detalle-factura.component';
import { DetalleNotaCreditoComponent } from './componentes/detalle-nota-credito/detalle-nota-credito.component';

@NgModule({
  declarations: [
    InventarioComponent,
    AddinventarioComponent,
    VentaComponent,
    PopsetstockComponent,
    PopsetclientComponent,
    LoginComponent,
    KardexComponent,
    ModalDetalleComponent,
    ClientesComponent,
    NotasCreditoComponent,
    NotaCreditoComponent,
    FacturasComponent,
    DetalleFacturaComponent,
    DetalleNotaCreditoComponent
  ],
  imports: [
    CommonModule,
    MarketRoutingModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCardModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTableModule,
    MatPaginatorModule,
    ClipboardModule,
    NgxBarcodeModule,
    MatTableExporterModule
  ]
})
export class MarketModule { }
