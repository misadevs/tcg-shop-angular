import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../carrito/data-access/carrito.service';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ProductoService } from '../data-access/producto.service';
import { Producto } from '../../shared/interfaces/producto.interface';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.scss',
})

export class ProductoComponent implements OnInit {
  public cards: Producto[] = [];
  mensaje: { texto: string, tipo: 'success' | 'error' } | null = null;
  
  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private router: Router
  ) { }
  
  async ngOnInit() {
    this.cards = await lastValueFrom(this.productoService.obtenerProducto()).then((prods) => prods);
  }

  agregarAlCarrito(producto: Producto) {
    const resultado = this.carritoService.agregarProducto(producto);
    
    this.mostrarMensaje(resultado.message, resultado.success ? 'success' : 'error');
  }

  irAlCarrito() {
    this.router.navigate(['/carrito']);
  }

  irAlInventario() {
    this.router.navigate(['/inventario']);
  }
  
  private mostrarMensaje(texto: string, tipo: 'success' | 'error') {
    this.mensaje = { texto, tipo };
    setTimeout(() => {
      this.mensaje = null;
    }, 3000);
  }
}