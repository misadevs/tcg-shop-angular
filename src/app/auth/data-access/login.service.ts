import { Injectable } from '@angular/core';
import { SupabaseService } from '../../shared/services/supabase.service';

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(private supabase: SupabaseService) {}

  async login(email: string, password: string) {
    const { data, error } = await this.supabase.client.auth.signInWithPassword({
      email,
      password
    });
    return { user: data.user, error };
  }
}