import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { SupabaseService } from '../../shared/services/supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private supabase: SupabaseService, private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const { data: { user } } = await this.supabase.client.auth.getUser();
    if (user) {
      return true;
    } else {
      return this.router.createUrlTree(['/login']);
    }
  }
}
