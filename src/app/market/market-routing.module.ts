import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { canActivate } from '@angular/fire/auth-guard';
import { environment } from '../../environments/environment.prod';

import { AddinventarioComponent } from './pages/addinventario/addinventario.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { VentaComponent } from './pages/venta/venta.component';
import { LoginComponent } from './pages/login/login.component';
import { KardexComponent } from './pages/kardex/kardex.component';


const routes: Routes = [
  { path: 'inventario', component: InventarioComponent},  
  { path: 'kardex', component: KardexComponent},
  { path: 'venta', component: VentaComponent},
   { path: 'addinventario', component: AddinventarioComponent},
   { path: 'addinventario/:id', component: AddinventarioComponent},
   {path: 'login', component: LoginComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketRoutingModule { }
