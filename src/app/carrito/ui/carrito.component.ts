import { CommonModule } from '@angular/common';
import { Component, OnInit, NgZone } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CarritoService } from '../data-access/carrito.service';
import { PedidoService } from '../data-access/pedido.service';
import { SupabaseService } from '../../shared/services/supabase.service';
import { environment } from '../../../environments/environment';
import { NgxPayPalModule, IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';

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
  imports: [CommonModule, RouterModule, NgxPayPalModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss']
})
export class CarritoComponent implements OnInit {
  carrito: ProductoEnCarrito[] = [];
  mensaje: { texto: string, tipo: 'success' | 'error' } | null = null;
  payPalConfig?: IPayPalConfig;
  
  constructor(
    private carritoService: CarritoService,
    private pedidoService: PedidoService,
    private supabaseService: SupabaseService,
    private ngZone: NgZone
  ) {}
  
  ngOnInit() {
    this.actualizarCarrito();
    this.initConfig();
  }

  private initConfig(): void {
    this.payPalConfig = {
      currency: 'MXN',
      clientId: environment.paypal.clientId,
      createOrderOnClient: (data) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'MXN',
              value: this.calcularTotal().toString(),
              breakdown: {
                item_total: {
                  currency_code: 'MXN',
                  value: this.calcularSubtotal().toString()
                },
                shipping: {
                  currency_code: 'MXN',
                  value: this.calcularEnvio().toString()
                }
              }
            },
            items: this.carrito.map(item => {
              return {
                name: item.nombre,
                quantity: item.cantidadEnCarrito?.toString() || '1',
                category: 'DIGITAL_GOODS',
                unit_amount: {
                  currency_code: 'MXN',
                  value: item.precio.toString(),
                }
              };
            })
          }
        ]
      },
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'vertical'
      },
      onApprove: (data, actions) => {
        actions.order.get();
      },
      onClientAuthorization: async (data) => {
        // Save order using the pedido service
        await this.guardarPedido(data);
        
        this.mostrarMensaje('¡Pago completado con éxito!', 'success');
        this.generarXML();
        this.carritoService.limpiarCarrito();
        this.actualizarCarrito();
      },
      onCancel: (data, actions) => {
        this.mostrarMensaje('Pago cancelado', 'error');
      },
      onError: err => {
        this.mostrarMensaje('Error en el proceso de pago', 'error');
      },
    };
  }

  async guardarPedido(paypalData: any) {
    try {
      // Get current authenticated user from Supabase
      const { data: { user } } = await this.supabaseService.client.auth.getUser();
      
      // Get user email from Supabase auth
      const userEmail = user?.email;
      console.log('Email del usuario autenticado:', userEmail);
      
      // Find the user ID in our database by email
      let idUsuario = 1; // Default guest user ID
      
      if (userEmail) {
        // Query the user table to find the user by email
        const { data: userData, error: userError } = await this.supabaseService.client
          .from('usuarios') // Adjust table name if different
          .select('id_usuario')
          .eq('correo', userEmail)
          .single();
          
        if (userData && !userError) {
          idUsuario = userData.id_usuario;
        }
      }
      
      const productos = this.carrito.map(item => ({
        id_producto: item.id,
        precio: item.precio,
        cantidadEnCarrito: item.cantidadEnCarrito || 1
      }));
      
      // Use pedidoService to create the order
      const pedido = await this.pedidoService.crearPedido(
        idUsuario, 
        productos, 
        this.calcularTotal()
      );
      
      console.log('Pedido guardado correctamente:', pedido);
    } catch (error) {
      console.error('Error al guardar el pedido:', error);
      this.mostrarMensaje('Error al guardar el pedido', 'error');
    }
  }

  actualizarCarrito() {
    this.carrito = this.carritoService.obtenerCarrito();
    
    // Reinicializar PayPal con el nuevo total
    if (this.carrito.length > 0) {
      this.initConfig();
    }
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
        
    const resultado = this.carritoService.actualizarCantidad(index, cantidadActual + 1);
    
    if (resultado.success) {
      this.actualizarCarrito();
    } else {
      this.mostrarMensaje(resultado.message, 'error');
    }
  }
  
  disminuirCantidad(index: number) {
    const cantidadActual = this.carrito[index].cantidadEnCarrito || 1;
        
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