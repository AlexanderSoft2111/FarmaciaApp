import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VentasComponent } from './pages/ventas/ventas.component';
import { AddinventarioComponent } from './pages/addinventario/addinventario.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { VentaComponent } from './pages/venta/venta.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { GenerarCodigoComponent } from './pages/generar-codigo/generar-codigo.component';
import { LoginComponent } from './pages/login/login.component';
import { canActivate } from '@angular/fire/auth-guard';
import { environment } from '../../environments/environment.prod';
import { KardexComponent } from './pages/kardex/kardex.component';


const routes: Routes = [
  { path: 'inventario', component: InventarioComponent, ...canActivate(environment.isAdmin)},  
  { path: 'ventas', component: VentasComponent, ...canActivate(environment.isAdmin)},
  { path: 'kardex', component: KardexComponent, ...canActivate(environment.isAdmin)},
  { path: 'venta', component: VentaComponent, ...canActivate(environment.isAdmin)},
   { path: 'addinventario', component: AddinventarioComponent, ...canActivate(environment.isAdmin)},
   { path: 'addinventario/:id', component: AddinventarioComponent, ...canActivate(environment.isAdmin)},
   { path: 'clientes', component: ClientesComponent, ...canActivate(environment.isAdmin)},
   { path: 'generarCodigo', component: GenerarCodigoComponent, ...canActivate(environment.isAdmin)},
   {path: 'login', component: LoginComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarketRoutingModule { }
