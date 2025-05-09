import { Injectable } from '@angular/core';
import { SupabaseService } from '../../shared/services/supabase.service';

@Injectable({ providedIn: 'root' })
export class RegisterService {
  constructor(private supabase: SupabaseService) {}

  async register(email: string, password: string, nombre: string) {
    const { data, error } = await this.supabase.client.auth.signUp({
      email,
      password,
      options: {
        data: { nombre }
      }
    });
    return { user: data.user, error };
  }
}