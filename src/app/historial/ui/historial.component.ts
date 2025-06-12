// file_path: src/app/historial/ui/historial.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HistorialService } from '../data-access/historial.service';
import { SupabaseService } from '../../shared/services/supabase.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, DatePipe],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss']
})
export class HistorialComponent implements OnInit {
  pedidos: any[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private historialService: HistorialService,
    private supabase: SupabaseService,
    private supabaseService: SupabaseService,
  ) {}

  async ngOnInit() {
    try {
        const { data: { user } } = await this.supabase.client.auth.getUser();
        if (user) {
          const { data: userData, error: userError } = await this.supabaseService.client
          .from('usuario')
          .select('id_usuario')
          .eq('google_id', user.id)
          .single();
    
        if (userError || !userData) {
          throw new Error('No se encontró el perfil del usuario en la base de datos.');
        }
        this.pedidos = await this.historialService.obtenerPedidos(userData.id_usuario);
      } else {
        this.error = 'Debes iniciar sesión para ver tu historial.';
      }
    } catch (err: any) {
      this.error = 'No se pudo cargar el historial de pedidos.';
      console.error('Error al cargar el historial', err);
    } finally {
      this.isLoading = false;
    }
  }
}