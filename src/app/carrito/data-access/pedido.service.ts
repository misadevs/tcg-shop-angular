import { Injectable } from '@angular/core';
import { SupabaseService } from '../../shared/services/supabase.service';

interface PedidoProducto {
  id_producto: number;
  precio: number;
  cantidadEnCarrito: number;
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  constructor(private supabase: SupabaseService) {}

  async crearPedido(id_usuario: number | string, productos: PedidoProducto[], precio_total: number) {
    try {
      // 1. Crear el pedido
      const { data: pedido, error: pedidoError } = await this.supabase.client
        .from('pedido')
        .insert([{ 
          id_usuario: id_usuario.toString(), // Convert to string to ensure compatibility with UUID
          precio_total, 
          estado: 'completado',
          fecha: new Date().toISOString(),
        }])
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // 2. Insertar productos del pedido
      const pedidoProductos = productos.map(p => ({
        id_producto: p.id_producto,
        id_pedido: pedido.id_pedido,
        cantidad: p.cantidadEnCarrito || 1,
        precio_unitario: p.precio
      }));

      const { error: productosError } = await this.supabase.client
        .from('pedido_producto')
        .insert(pedidoProductos);

      if (productosError) throw productosError;

      return pedido;
    } catch (error) {
      console.error('Error al crear pedido:', error);
      throw error;
    }
  }
}
