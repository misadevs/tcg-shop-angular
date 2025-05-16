import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Producto } from '../../shared/interfaces/producto.interface';
import { SupabaseService } from '../../shared/services/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private productosSubject = new BehaviorSubject<Producto[]>([]);
  productos$ = this.productosSubject.asObservable();

  constructor(private supabase: SupabaseService) {
    this.verificarTabla();
    this.cargarProductos();
  }

  async verificarTabla(): Promise<void> {
    try {
      // Try to select a single row to check table structure
      const { data, error, count } = await this.supabase.client
        .from('producto')
        .select('*', { count: 'exact' })
        .limit(1);

      if (error) {
        console.error('Error al verificar tabla productos:', error);
        return;
      }

      console.log('Tabla productos encontrada. Número de registros:', count);
      console.log('Ejemplo de estructura:', data && data.length > 0 ? data[0] : 'No hay registros');
      
    } catch (error) {
      console.error('Error al verificar tabla:', error);
    }
  }

  async cargarProductos(): Promise<void> {
    try {
      const { data: productos, error } = await this.supabase.client
        .from('producto')
        .select('*');

      if (error) {
        console.error('Error al cargar productos:', error);
        return;
      }

      // Log the raw data to see the actual field names
      console.log('Datos crudos del producto:', productos.length > 0 ? productos[0] : 'No hay productos');

      console.log(productos)

      // Convert DB rows to Producto objects
      const productosFormateados: Producto[] = productos.map(p => ({
        // Check for different possible ID field names
        id: p.id || p.id_producto || 0,
        nombre: p.nombre || '',
        imagen: p.imagen || '',
        precio: p.precio || 0,
        cantidad: p.cantidad || 0,
        descripcion: p.descripcion || '',
        psa: p.psa || 0,
        rareza: p.rareza || ''
      }));

      this.productosSubject.next(productosFormateados);
    } catch (error) {
      console.error('Error al cargar los productos:', error);
    }
  }

  async agregarProducto(producto: Producto): Promise<void> {
    try {
      console.log('Intentando agregar producto:', producto);
      
      // Explicitly create the object to match Supabase table structure
      const productoParaDB = {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        cantidad: producto.cantidad,
        imagen: producto.imagen,
        rareza: producto.rareza,
        psa: producto.psa
      };
      
      console.log('Datos a insertar en Supabase:', productoParaDB);
      
      const { data, error } = await this.supabase.client
        .from('producto')
        .insert(productoParaDB)
        .select();

      if (error) {
        console.error('Error detallado al agregar producto:', error);
        throw error;
      }

      console.log('Producto agregado con éxito:', data);

      // Update the local state with the new product
      const productos = this.productosSubject.value;
      if (data && data.length > 0) {
        this.productosSubject.next([...productos, data[0]]);
      } else {
        console.warn('No se recibieron datos del producto agregado');
        // Refresh products from database to ensure UI is updated
        this.cargarProductos();
      }
    } catch (error) {
      console.error('Error al agregar el producto:', error);
      throw error;
    }
  }

  async actualizarProducto(producto: Producto): Promise<void> {
    try {
      console.log('Actualizando producto:', producto);
      
      // Explicitly create the object to match Supabase table structure
      const productoParaDB = {
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        cantidad: producto.cantidad,
        imagen: producto.imagen,
        rareza: producto.rareza,
        psa: producto.psa
      };
      
      console.log(`Actualizando producto con ID ${producto.id}:`, productoParaDB);
      
      const { data, error } = await this.supabase.client
        .from('producto')
        .update(productoParaDB)
        .eq('id', producto.id)
        .select();

      if (error) {
        console.error('Error detallado al actualizar producto:', error);
        throw error;
      }

      console.log('Producto actualizado con éxito:', data);

      // Update the local state
      const productos = this.productosSubject.value;
      const index = productos.findIndex(p => p.id === producto.id);
      
      if (index !== -1) {
        productos[index] = { ...producto };
        this.productosSubject.next([...productos]);
      } else {
        console.warn('No se encontró el producto en el estado local');
        // Refresh products from database
        this.cargarProductos();
      }
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      throw error;
    }
  }

  async eliminarProducto(id: number): Promise<void> {
    try {
      console.log(`Eliminando producto con ID ${id}`);
      
      const { data, error } = await this.supabase.client
        .from('producto')
        .delete()
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error detallado al eliminar producto:', error);
        throw error;
      }

      console.log('Producto eliminado con éxito:', data);

      // Update the local state
      const productos = this.productosSubject.value;
      this.productosSubject.next(productos.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      throw error;
    }
  }
}