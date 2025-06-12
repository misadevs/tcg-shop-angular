// file_path: src/app/inventario/data-access/inventario.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Producto } from '../../shared/interfaces/producto.interface';
import { SupabaseService } from '../../shared/services/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private productosSubject = new BehaviorSubject<Producto[]>([]);
  productos$ = this.productosSubject.asObservable();

  constructor(private supabase: SupabaseService) {
    this.cargarProductos();
  }

  async cargarProductos(): Promise<void> {
    try {
      const { data: productos, error } = await this.supabase.client
        .from('producto')
        .select('*')
        .order('id_producto', { ascending: true });

      if (error) throw error;
      
      const productosFormateados: Producto[] = productos.map(p => ({
        id: p.id_producto,
        nombre: p.nombre || '',
        imagen: p.imagen || '',
        precio: p.precio || 0,
        cantidad: p.cantidad || 0,
        descripcion: p.descripcion || '',
        psa: p.psa || 0,
        rareza: p.rareza || '',
        tipo: p.tipo || '' 
      }));

      this.productosSubject.next(productosFormateados);
    } catch (error) {
      console.error('Error al cargar los productos:', error);
    }
  }

  async agregarProducto(producto: Producto): Promise<void> {
    const productoParaDB = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      cantidad: producto.cantidad,
      imagen: producto.imagen,
      rareza: producto.rareza,
      psa: producto.psa
    };
    
    const { error } = await this.supabase.client
      .from('producto')
      .insert(productoParaDB);

    if (error) {
      console.error('Error al agregar el producto:', error);
      throw error;
    }

    // Después de agregar, recargamos la lista completa. Es más simple y seguro.
    await this.cargarProductos();
  }

  async actualizarProducto(producto: Producto): Promise<void> {
    const productoParaDB = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      cantidad: producto.cantidad,
      imagen: producto.imagen,
      rareza: producto.rareza,
      psa: producto.psa
    };
    
    const { error } = await this.supabase.client
      .from('producto')
      .update(productoParaDB)
      .eq('id_producto', producto.id);

    if (error) {
      console.error('Error al actualizar el producto:', error);
      throw error;
    }
    
    // Después de actualizar, recargamos la lista completa.
    await this.cargarProductos();
  }

  async eliminarProducto(id: number): Promise<void> {
    const { error } = await this.supabase.client
      .from('producto')
      .delete()
      .eq('id_producto', id);

    if (error) {
      console.error('Error al eliminar el producto:', error);
      throw error;
    }

    // Después de eliminar, también recargamos la lista.
    await this.cargarProductos();
  }
}