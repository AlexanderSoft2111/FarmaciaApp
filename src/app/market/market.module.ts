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
    ClientesComponent
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
    ClipboardModule
  ]
})
export class MarketModule { }
