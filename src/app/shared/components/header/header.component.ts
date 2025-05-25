import { Component, OnInit, OnDestroy } from "@angular/core";
import { RouterLink, Router } from "@angular/router";
import { SupabaseService } from "../../services/supabase.service";
import { CommonModule } from "@angular/common";
import type { Subscription as SupabaseSubscription } from '@supabase/supabase-js';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit, OnDestroy {
  title = 'Pokémon TCG Shop';
  isAdmin: boolean = false;
  private authSubscription!: SupabaseSubscription;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    this.authSubscription = this.supabaseService.client.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          await this.checkUserRole();
        } else if (event === 'SIGNED_OUT') {
          this.isAdmin = false;
        }
      }
    ).data.subscription;
    // Initial check
    await this.checkUserRole(); 
  }

  async checkUserRole() {
    const { data: { user } } = await this.supabaseService.client.auth.getUser();
    if (user) {
      const { data: userData, error } = await this.supabaseService.client
        .from('usuario')
        .select('rol')
        .eq('google_id', user.id)
        .single();
      this.isAdmin = !!(userData && userData.rol === 'admin');
    } else {
      this.isAdmin = false;
    }
  }
  
  async cerrarSesion(): Promise<void> {
    try {
      const { error } = await this.supabaseService.client.auth.signOut();
      
      if (error) {
        console.error('Error al cerrar sesión:', error.message);
        return;
      }
      
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}