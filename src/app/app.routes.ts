import { Routes } from '@angular/router';
import { ProductoComponent } from './productos/ui/producto.component';
import { CarritoComponent } from './carrito/ui/carrito.component';
import { InventarioComponent } from './inventario/ui/inventario.component';
import { LoginComponent } from './auth/ui/login/login.component';
import { RegisterComponent } from './auth/ui/register/register.component';
import { AuthGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
    { path: '', component: ProductoComponent, canActivate: [AuthGuard] },
    { path: 'carrito', component: CarritoComponent, canActivate: [AuthGuard] },
    { path: 'inventario', component: InventarioComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent }
];
