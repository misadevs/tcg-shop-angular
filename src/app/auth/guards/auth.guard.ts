import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SupabaseService } from '../../shared/services/supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private supabase: SupabaseService, private router: Router) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    const { data: { user } } = await this.supabase.client.auth.getUser();
    const adminRoutes = ['/inventario', '/gestion-usuarios']; // Arreglo de rutas de admin
  
    if (user) {
      if (adminRoutes.includes(state.url)) {
        const { data: userData, error } = await this.supabase.client
          .from('usuario')
          .select('rol')
          .eq('google_id', user.id)
          .single();
  
        if (error || !userData || userData.rol !== 'admin') {
          console.error('Acceso denegado. Se requiere rol de administrador.');
          return this.router.createUrlTree(['/']);
        }
        return true;
      }
      return true;
    } else {
      return this.router.createUrlTree(['/login']);
    }
  }
}
