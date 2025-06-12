import { Pipe, PipeTransform } from '@angular/core';
import { Producto } from '../../shared/interfaces/producto.interface';

@Pipe({
  name: 'productosFilter',
  standalone: true,
})
export class ProductosFilterPipe implements PipeTransform {
  transform(items: Producto[], searchTerm: string, rareza: string, psa: number | string): Producto[] {
    if (!items) {
      return [];
    }

    let filteredItems = items;

    // Filtrar por término de búsqueda (nombre)
    if (searchTerm) {
      filteredItems = filteredItems.filter(item =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por rareza
    if (rareza) {
      filteredItems = filteredItems.filter(item => item.rareza === rareza);
    }
    
    // Filtrar por PSA
    if (psa && psa !== 'any') {
        const psaValue = Number(psa);
        if (psaValue === 0) {
            // "Sin calificar"
            filteredItems = filteredItems.filter(item => !item.psa || item.psa === 0);
        } else {
            filteredItems = filteredItems.filter(item => item.psa === psaValue);
        }
    }

    return filteredItems;
  }
}