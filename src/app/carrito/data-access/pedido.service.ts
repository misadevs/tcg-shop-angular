// file_path: src/app/carrito/data-access/pedido.service.ts
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

  async crearPedido(id_usuario: number, productos: PedidoProducto[], precio_total: number) {
    try {
      const { data, error } = await this.supabase.client.rpc('crear_pedido_y_actualizar_stock', {
        id_usuario_arg: id_usuario,
        productos_arg: productos,
        precio_total_arg: precio_total
      });

      if (error) {
        console.error('Error al ejecutar la función de pedido:', error);
        throw error;
      }
      
      console.log('Pedido creado y stock actualizado. ID del pedido:', data);
      return data;

    } catch (error) {
      console.error('Error al crear pedido:', error);
      throw error;
    }
  }
}