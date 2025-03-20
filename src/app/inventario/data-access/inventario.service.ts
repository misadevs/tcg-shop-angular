import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap, catchError } from 'rxjs';
import { Producto } from '../../shared/interfaces/producto.interface';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private productosSubject = new BehaviorSubject<Producto[]>([]);
  productos$ = this.productosSubject.asObservable();

  constructor(private http: HttpClient) {
    this.cargarProductos();
  }

  cargarProductos(): void {
    const productos = localStorage.getItem('productos');

    if (productos) {
      this.productosSubject.next(this.parseXML(productos));
    } else {
      this.http.get('productos.xml', { responseType: 'text' }).pipe(
        map(xml => this.parseXML(xml)),
        catchError(error => {
          console.error('Error al cargar los productos:', error);
          return [];
        })
      ).subscribe(productos => {
        this.productosSubject.next(productos);
        this.guardarCambios();
      });
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

  agregarProducto(producto: Producto): void {
    // En un caso real, aquí enviarías una solicitud POST al servidor
    const productos = this.productosSubject.value;
    // Asignar un ID único (el máximo actual + 1)
    const maxId = Math.max(...productos.map(p => p.id), 0);
    producto.id = maxId + 1;
    
    this.productosSubject.next([...productos, producto]);
    this.guardarCambios();
  }

  actualizarProducto(producto: Producto): void {
    // En un caso real, aquí enviarías una solicitud PUT al servidor
    const productos = this.productosSubject.value;
    const index = productos.findIndex(p => p.id === producto.id);
    
    if (index !== -1) {
      productos[index] = { ...producto };
      this.productosSubject.next([...productos]);
      this.guardarCambios();
    }
  }

  eliminarProducto(id: number): void {
    // En un caso real, aquí enviarías una solicitud DELETE al servidor
    const productos = this.productosSubject.value;
    this.productosSubject.next(productos.filter(p => p.id !== id));
    this.guardarCambios();
  }

  private guardarCambios(): void {
    // Esta función generaría un XML actualizado y lo enviaría al servidor
    const productos = this.productosSubject.value;
    const xml = this.generarXML(productos);

    localStorage.setItem('productos', xml);
    
    // En una aplicación real, enviarías este XML al servidor con una petición HTTP
    console.log('XML actualizado:', xml);
    
    // Simulación de guardado (en una app real, esto sería una petición HTTP)
    // this.http.post('api/guardar-productos', xml).subscribe();
  }

  private generarXML(productos: Producto[]): string {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<productos>\n`;
    
    productos.forEach(producto => {
      xml += `<producto id="${producto.id}">
            <nombre>${producto.nombre}</nombre>
            <precio>${producto.precio}</precio>
            <cantidad>${producto.cantidad}</cantidad>
            <imagen>${producto.imagen}</imagen>
            </producto>\n`;
    });
    
    xml += '</productos>';
    return xml;
  }
}