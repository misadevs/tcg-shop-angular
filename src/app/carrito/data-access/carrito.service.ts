import { Injectable } from "@angular/core";
import { Producto } from "../../shared/interfaces/producto.interface";

// Extend the Producto interface with an optional cantidadEnCarrito property
interface ProductoEnCarrito extends Producto {
  cantidadEnCarrito?: number;
}

@Injectable({
  providedIn: "root"
})
export class CarritoService {
  private carrito: ProductoEnCarrito[] = [];

  constructor() {
    // Load cart from localStorage if available
    const savedCart = localStorage.getItem('carrito');
    if (savedCart) {
      this.carrito = JSON.parse(savedCart);
    }
  }

  agregarProducto(producto: Producto): { success: boolean, message: string } {
    // Find if product already exists in cart
    const itemExistente = this.carrito.find(item => item.id === producto.id);
    
    if (itemExistente) {
      // Check if adding one more would exceed stock
      if ((itemExistente.cantidadEnCarrito || 1) >= producto.cantidad) {
        return { 
          success: false, 
          message: `No hay más stock disponible. Máximo: ${producto.cantidad}`
        };
      }
      
      // Increment quantity
      itemExistente.cantidadEnCarrito = (itemExistente.cantidadEnCarrito || 1) + 1;
    } else {
      // Add new product with quantity 1
      this.carrito.push({ ...producto, cantidadEnCarrito: 1 });
    }
    
    this.guardarCarrito();
    return { success: true, message: 'Producto agregado al carrito' };
  }

  obtenerCarrito(): ProductoEnCarrito[] {
    return this.carrito;
  }

  eliminarProducto(index: number): void {
    this.carrito.splice(index, 1);
    this.guardarCarrito();
  }

  actualizarCantidad(index: number, nuevaCantidad: number): { success: boolean, message: string } {
    if (index >= 0 && index < this.carrito.length) {
      const item = this.carrito[index];
      
      // Check stock limit
      if (nuevaCantidad > item.cantidad) {
        return { 
          success: false, 
          message: `No hay suficiente stock. Máximo: ${item.cantidad}`
        };
      }
      
      if (nuevaCantidad <= 0) {
        // Remove item if quantity is 0 or less
        this.eliminarProducto(index);
      } else {
        // Update quantity
        item.cantidadEnCarrito = nuevaCantidad;
        this.guardarCarrito();
      }
      return { success: true, message: 'Cantidad actualizada' };
    }
    return { success: false, message: 'Producto no encontrado' };
  }

  generarXML() {
    let subtotal = 0;
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <recibo>\n`;
    
    this.carrito.forEach((producto) => {
      const cantidad = producto.cantidadEnCarrito || 1;
      const precioTotal = producto.precio * cantidad;
      
      xml += `<producto id="${producto.id}">
        <nombre>${producto.nombre}</nombre>
        <precio>${producto.precio}</precio>
        <cantidad>${cantidad}</cantidad>
        <total>${precioTotal}</total>
      </producto>\n`;
      
      subtotal += precioTotal;
    });

    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    xml += `<subtotal>${subtotal.toFixed(2)}</subtotal>
    <iva>${iva.toFixed(2)}</iva>
    <total>${total.toFixed(2)}</total>
    </recibo>`;
    
    const blob = new Blob([xml], {type: 'application/xml'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = 'recibo.xml';
    a.href = url;
    
    document.body.appendChild(a);
    a.click();
    
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  limpiarCarrito(): void {
    this.carrito = [];
    this.guardarCarrito();
  }

  private guardarCarrito(): void {
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
  }
}