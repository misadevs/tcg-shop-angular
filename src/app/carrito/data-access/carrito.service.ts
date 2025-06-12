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
    const itemExistente = this.carrito.find(item => item.id === producto.id);
  
    // Verificación 1: Si el producto ya está en el carrito, no se puede agregar más que el stock total.
    if (itemExistente && (itemExistente.cantidadEnCarrito || 0) >= producto.cantidad) {
      return { 
        success: false, 
        message: `No hay más stock disponible. Máximo: ${producto.cantidad}`
      };
    }
  
    // Verificación 2: Si el producto es nuevo en el carrito, pero su stock es 0, no se puede agregar.
    if (!itemExistente && producto.cantidad <= 0) {
      return { success: false, message: 'Este producto no tiene stock disponible.' };
    }
  
    // Si pasa las verificaciones, procede a agregar o actualizar.
    if (itemExistente) {
      itemExistente.cantidadEnCarrito = (itemExistente.cantidadEnCarrito || 0) + 1;
    } else {
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