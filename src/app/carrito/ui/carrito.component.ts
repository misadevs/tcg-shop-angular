import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CarritoService } from '../data-access/carrito.service';

interface ProductoEnCarrito {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
  descripcion: string;
  cantidad: number;
  rareza?: string;
  psa?: number;
  cantidadEnCarrito?: number;
}

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss']
})
export class CarritoComponent implements OnInit {
  carrito: ProductoEnCarrito[] = [];
  mensaje: { texto: string, tipo: 'success' | 'error' } | null = null;
  
  constructor(private carritoService: CarritoService) {}
  
  ngOnInit() {
    this.actualizarCarrito();
  }
  
  actualizarCarrito() {
    this.carrito = this.carritoService.obtenerCarrito();
    console.log('Carrito actualizado:', this.carrito);
  }

  generarXML() {
    this.carritoService.generarXML();
    this.mostrarMensaje('Factura XML generada correctamente', 'success');
  }

  eliminarProducto(index: number) {
    this.carritoService.eliminarProducto(index);
    this.actualizarCarrito();
    this.mostrarMensaje('Producto eliminado del carrito', 'success');
  }
  
  aumentarCantidad(index: number) {
    // Get the current quantity before making changes
    const cantidadActual = this.carrito[index].cantidadEnCarrito || 1;
    
    console.log(`Aumentando cantidad para el ítem ${index} de ${cantidadActual} a ${cantidadActual + 1}`);
    
    const resultado = this.carritoService.actualizarCantidad(index, cantidadActual + 1);
    
    if (resultado.success) {
      this.actualizarCarrito();
    } else {
      this.mostrarMensaje(resultado.message, 'error');
    }
  }
  
  disminuirCantidad(index: number) {
    const cantidadActual = this.carrito[index].cantidadEnCarrito || 1;
    
    console.log(`Disminuyendo cantidad para el ítem ${index} de ${cantidadActual} a ${cantidadActual - 1}`);
    
    if (cantidadActual > 1) {
      const resultado = this.carritoService.actualizarCantidad(index, cantidadActual - 1);
      
      if (resultado.success) {
        this.actualizarCarrito();
      } else {
        this.mostrarMensaje(resultado.message, 'error');
      }
    } else {
      this.eliminarProducto(index);
    }
  }
  
  getTotalItems(): number {
    return this.carrito.reduce((total, item) => 
      total + (item.cantidadEnCarrito || 1), 0);
  }
  
  calcularSubtotal(): number {
    return this.carrito.reduce((total, item) => 
      total + (item.precio * (item.cantidadEnCarrito || 1)), 0);
  }
  
  calcularEnvio(): number {
    const subtotal = this.calcularSubtotal();
    // Free shipping on orders over $100
    return subtotal > 100 ? 0 : 10;
  }
  
  calcularTotal(): number {
    return this.calcularSubtotal() + this.calcularEnvio();
  }
  
  private mostrarMensaje(texto: string, tipo: 'success' | 'error') {
    this.mensaje = { texto, tipo };
    setTimeout(() => {
      this.mensaje = null;
    }, 3000);
  }
}