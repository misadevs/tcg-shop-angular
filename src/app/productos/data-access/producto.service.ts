import { inject, Injectable } from '@angular/core';
import { Observable, from, map, catchError, of, tap } from 'rxjs';
import { Producto } from '../../shared/interfaces/producto.interface';
import { SupabaseService } from '../../shared/services/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private supabase = inject(SupabaseService);

  obtenerProducto(): Observable<Producto[]> {
    console.log('ProductoService: Obteniendo productos de Supabase');
    
    return from(this.supabase.client.from('producto').select('*')).pipe(
      tap(response => {
        if (response.error) {
          console.error('Error al obtener productos:', response.error);
        } else {
          console.log(`Se encontraron ${response.data?.length || 0} productos`);
        }
      }),
      map(response => {
        if (response.error) {
          throw response.error;
        }
        
        // Convert DB rows to Producto objects
        return response.data.map(p => ({
          id: p.id_producto,
          nombre: p.nombre || '',
          imagen: p.imagen || '',
          precio: p.precio || 0,
          cantidad: p.cantidad || 0,
          descripcion: p.descripcion || '',
          psa: p.psa || 0,
          rareza: p.rareza || ''
        }));
      }),
      catchError(error => {
        console.error('Error al obtener productos de Supabase:', error);
        return of([]);
      })
    );
  }
}