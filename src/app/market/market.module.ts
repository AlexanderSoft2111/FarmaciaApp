import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketRoutingModule } from './market-routing.module';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { VentasComponent } from './pages/ventas/ventas.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AddinventarioComponent } from './pages/addinventario/addinventario.component';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import { VentaComponent } from './pages/venta/venta.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { PopsetstockComponent } from './componentes/popsetstock/popsetstock.component';
import { GenerarCodigoComponent } from './pages/generar-codigo/generar-codigo.component';
import { NgxBarcodeModule } from 'ngx-barcode';
import { ModalventaComponent } from './componentes/modalventa/modalventa.component';
import { PopAddProductoComponent } from './componentes/pop-add-producto/pop-add-producto.component';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { PopsetclientComponent } from './componentes/popsetclient/popsetclient.component';
import { LoginComponent } from './pages/login/login.component';
import { KardexComponent } from './pages/kardex/kardex.component';
import { ModalKardexComponent } from './componentes/modal-kardex/modal-kardex.component';

@NgModule({
  declarations: [
    InventarioComponent,
    VentasComponent,
    AddinventarioComponent,
    InventarioComponent,
    VentaComponent,
    ClientesComponent,
    PopsetstockComponent,
    GenerarCodigoComponent,
    ModalventaComponent,
    PopAddProductoComponent,
    PopsetclientComponent,
    LoginComponent,
    KardexComponent,
    ModalKardexComponent
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
    NgxBarcodeModule,
    ClipboardModule
  ]
})
export class MarketModule { }
