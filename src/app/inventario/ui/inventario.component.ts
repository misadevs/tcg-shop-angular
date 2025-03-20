import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../data-access/inventario.service';
import { Producto } from '../../shared/interfaces/producto.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class InventarioComponent implements OnInit {
  productos: Producto[] = [];
  productoSeleccionado: Producto | null = null;
  modoEdicion = false;
  
  nuevoProducto: Producto = this.inicializarProducto();

  constructor(
    private inventarioService: InventarioService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inventarioService.productos$.subscribe(productos => {
      this.productos = productos;
    });
  }

  inicializarProducto(): Producto {
    return {
      id: 0,
      nombre: '',
      precio: 0,
      cantidad: 1,
      imagen: '',
      descripcion: '',
      psa: 0,
      rareza: ''
    };
  }

  agregarProducto(): void {
    if (this.validarProducto(this.nuevoProducto)) {
      this.inventarioService.agregarProducto({...this.nuevoProducto});
      this.resetearFormulario();
      alert('Tarjeta agregada con éxito');
    } else {
      alert('Por favor completa los campos requeridos');
    }
  }

  irAProductos() {
    this.router.navigate(['/']);
  }

  seleccionarProducto(producto: Producto): void {
    this.productoSeleccionado = {...producto};
    this.modoEdicion = true;
  }

  actualizarProducto(): void {
    if (this.productoSeleccionado && this.validarProducto(this.productoSeleccionado)) {
      this.inventarioService.actualizarProducto(this.productoSeleccionado);
      this.cancelarEdicion();
      alert('Tarjeta actualizada con éxito');
    } else {
      alert('Por favor completa los campos requeridos');
    }
  }

  eliminarProducto(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarjeta?')) {
      this.inventarioService.eliminarProducto(id);
      if (this.productoSeleccionado?.id === id) {
        this.cancelarEdicion();
      }
      alert('Tarjeta eliminada con éxito');
    }
  }

  cancelarEdicion(): void {
    this.productoSeleccionado = null;
    this.modoEdicion = false;
  }

  resetearFormulario(): void {
    this.nuevoProducto = this.inicializarProducto();
  }

  private validarProducto(producto: Producto): boolean {
    return !!producto.nombre && producto.precio > 0 && producto.cantidad >= 0;
  }
}