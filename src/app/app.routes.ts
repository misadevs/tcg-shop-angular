import { Routes } from '@angular/router';
import { ProductoComponent } from './productos/ui/producto.component';
import { CarritoComponent } from './carrito/ui/carrito.component';
import { InventarioComponent } from './inventario/ui/inventario.component';

export const routes: Routes = [
    {path: '', component: ProductoComponent},
    {path: 'carrito', component: CarritoComponent},
    {path: 'inventario', component: InventarioComponent}
];
