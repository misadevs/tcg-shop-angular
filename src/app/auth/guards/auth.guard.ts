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
    if (user) {
      if (state.url === '/inventario') {
        const { data: userData, error } = await this.supabase.client
          .from('usuario')
          .select('rol')
          .eq('google_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          return this.router.createUrlTree(['/login']);
        }

        if (userData && userData.rol === 'admin') {
          return true;
        } else {
          // Redirect to home or an unauthorized page if not admin
          return this.router.createUrlTree(['/']); 
        }
      }
      return true;
    } else {
      return this.router.createUrlTree(['/login']);
    }
  }
}
