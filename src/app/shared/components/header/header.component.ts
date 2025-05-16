import { Component } from "@angular/core";
import { RouterLink, Router } from "@angular/router";
import { SupabaseService } from "../../services/supabase.service";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent {
  title = 'Pokémon TCG Shop';

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {}
  
  async cerrarSesion(): Promise<void> {
    try {
      // Sign out using Supabase
      const { error } = await this.supabaseService.client.auth.signOut();
      
      if (error) {
        console.error('Error al cerrar sesión:', error.message);
        return;
      }
      
      // Clear any local storage items related to auth
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      
      // Navigate to home page
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}