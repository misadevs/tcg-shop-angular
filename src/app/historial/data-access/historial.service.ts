import { Injectable } from '@angular/core';
import { SupabaseService } from '../../shared/services/supabase.service';

@Injectable({ providedIn: 'root' })
export class HistorialService {
  constructor(private supabase: SupabaseService) {}

  async obtenerPedidos(id_usuario: string) {
    const { data, error } = await this.supabase.client
      .from('pedido')
      .select(`
        id_pedido,
        fecha,
        precio_total,
        estado,
        pedido_producto (
          cantidad,
          precio_unitario,
          producto (
            nombre,
            imagen
          )
        )
      `)
      .eq('id_usuario', id_usuario)
      .order('fecha', { ascending: false });

    if (error) {
      throw error;
    }
    return data;
  }
}