import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Producto } from '../../shared/interfaces/producto.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private xmlUrl = 'productos.xml';
  private http = inject(HttpClient);

  obtenerProducto(): Observable<Producto[]>{
    const productos = localStorage.getItem('productos');

    if (productos) {
      return new Observable<Producto[]>(observer => {
        observer.next(this.parseXML(productos));
        observer.complete();
      });
    } else {
      return this.http.get(this.xmlUrl, { responseType: 'text' }).pipe(
        map(xml => this.parseXML(xml)),
        catchError(error => {
          console.error('Error al cargar los productos:', error);
          return [];
        })
      )
    }
  }

  private parseXML(xml: string): Producto[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const productos: Producto[] = [];
    
    Array.from(xmlDoc.getElementsByTagName('producto')).forEach(prod => {
      const id = parseInt(prod.getAttribute('id') || '0');
      
      productos.push({
        id: id,
        nombre: prod.getElementsByTagName('nombre')[0]?.textContent || '',
        imagen: prod.getElementsByTagName('imagen')[0]?.textContent || '',
        precio: parseInt(prod.getElementsByTagName('precio')[0]?.textContent || '0'),
        cantidad: parseInt(prod.getElementsByTagName('cantidad')[0]?.textContent || '0'),
        descripcion: prod.getElementsByTagName('descripcion')[0]?.textContent || '',
        psa: parseInt(prod.getElementsByTagName('psa')[0]?.textContent || '0'),
        rareza: prod.getElementsByTagName('rareza')[0]?.textContent || '',
      });
    });
    
    return productos;
  }
}