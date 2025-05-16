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
  isLoading = false;
  mensaje: { texto: string, tipo: 'success' | 'error' } | null = null;
  
  nuevoProducto: Producto = this.inicializarProducto();

  constructor(
    private inventarioService: InventarioService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }
  
  cargarProductos(): void {
    this.isLoading = true;
    this.inventarioService.productos$.subscribe(productos => {
      this.productos = productos;
      this.isLoading = false;
    });
    
    // Ensure data is loaded from the database
    this.inventarioService.cargarProductos();
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

  async agregarProducto(): Promise<void> {
    console.log('Datos del formulario:', this.nuevoProducto);
    
    // Validate form data first
    if (this.validarProducto(this.nuevoProducto)) {
      this.isLoading = true;
      try {
        // Make sure numeric fields are actually numbers
        const productoParaGuardar = {
          ...this.nuevoProducto,
          precio: Number(this.nuevoProducto.precio),
          cantidad: Number(this.nuevoProducto.cantidad),
          psa: Number(this.nuevoProducto.psa || 0)
        };
        
        console.log('Producto validado para guardar:', productoParaGuardar);
        
        await this.inventarioService.agregarProducto(productoParaGuardar);
        
        this.resetearFormulario();
        this.mostrarMensaje('Tarjeta agregada con éxito', 'success');
      } catch (error) {
        console.error('Error al agregar producto:', error);
        this.mostrarMensaje('Error al agregar la tarjeta. Revisa la consola para más detalles.', 'error');
      } finally {
        this.isLoading = false;
      }
    } else {
      this.mostrarMensaje('Por favor completa los campos requeridos', 'error');
    }
  }

  irAProductos() {
    this.router.navigate(['/']);
  }

  seleccionarProducto(producto: Producto): void {
    this.productoSeleccionado = {...producto};
    this.modoEdicion = true;
  }

  async actualizarProducto(): Promise<void> {
    if (this.productoSeleccionado && this.validarProducto(this.productoSeleccionado)) {
      this.isLoading = true;
      try {
        // Make sure numeric fields are actually numbers
        const productoParaActualizar = {
          ...this.productoSeleccionado,
          precio: Number(this.productoSeleccionado.precio),
          cantidad: Number(this.productoSeleccionado.cantidad),
          psa: Number(this.productoSeleccionado.psa || 0)
        };
        
        console.log('Producto validado para actualizar:', productoParaActualizar);
        
        await this.inventarioService.actualizarProducto(productoParaActualizar);
        this.cancelarEdicion();
        this.mostrarMensaje('Tarjeta actualizada con éxito', 'success');
      } catch (error) {
        console.error('Error al actualizar producto:', error);
        this.mostrarMensaje('Error al actualizar la tarjeta. Revisa la consola para más detalles.', 'error');
      } finally {
        this.isLoading = false;
      }
    } else {
      this.mostrarMensaje('Por favor completa los campos requeridos', 'error');
    }
  }

  async eliminarProducto(id: number): Promise<void> {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarjeta?')) {
      this.isLoading = true;
      try {
        await this.inventarioService.eliminarProducto(id);
        if (this.productoSeleccionado?.id === id) {
          this.cancelarEdicion();
        }
        this.mostrarMensaje('Tarjeta eliminada con éxito', 'success');
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        this.mostrarMensaje('Error al eliminar la tarjeta', 'error');
      } finally {
        this.isLoading = false;
      }
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
  
  private mostrarMensaje(texto: string, tipo: 'success' | 'error') {
    this.mensaje = { texto, tipo };
    setTimeout(() => {
      this.mensaje = null;
    }, 3000);
  }
}