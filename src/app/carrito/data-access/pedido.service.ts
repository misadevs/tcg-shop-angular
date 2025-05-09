import { Injectable } from '@angular/core';
import { SupabaseService } from '../../shared/services/supabase.service';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  constructor(private supabase: SupabaseService) {}

  async crearPedido(id_usuario: number, productos: any[], precio_total: number) {
    // 1. Crear el pedido
    const { data: pedido, error: pedidoError } = await this.supabase.client
      .from('pedido')
      .insert([{ id_usuario, precio_total, estado: 'pendiente' }])
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
  }
}
