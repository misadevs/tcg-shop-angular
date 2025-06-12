// file_path: src/app/productos/ui/producto.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Asegúrate de importar CurrencyPipe si lo usas en el HTML
import { CarritoService } from '../../carrito/data-access/carrito.service';
import { Router } from '@angular/router';
import { lastValueFrom, Subscription } from 'rxjs';
import { debounceTime, startWith } from 'rxjs/operators';
import { ProductoService } from '../data-access/producto.service';
import { Producto } from '../../shared/interfaces/producto.interface';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss'],
})
export class ProductoComponent implements OnInit, OnDestroy {
  public allCards: Producto[] = [];
  public filteredCards: Producto[] = [];
  mensaje: { texto: string, tipo: 'success' | 'error' } | null = null;
  
  public filterForm: FormGroup;
  private filterSubscription: Subscription | undefined;

  public rarities: string[] = ["Common", "Uncommon", "Rare", "Holo Rare", "Ultra Rare", "Secret Rare"];

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private router: Router
  ) {
    this.filterForm = new FormGroup({
      searchTerm: new FormControl(''),
      rareza: new FormControl(''),
      sortBy: new FormControl('precio-asc'),
    });
  }
  
  async ngOnInit() {
    this.allCards = await lastValueFrom(this.productoService.obtenerProducto());
    
    this.filterSubscription = this.filterForm.valueChanges.pipe(
      debounceTime(300),
      startWith(this.filterForm.value)
    ).subscribe(values => {
      this.applyFiltersAndSort(values);
    });
  }

  ngOnDestroy() {
    this.filterSubscription?.unsubscribe();
  }

  applyFiltersAndSort(filters: any) {
    let cards = [...this.allCards];

    if (filters.searchTerm) {
      cards = cards.filter(card => card.nombre.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    }
    if (filters.rareza) {
      cards = cards.filter(card => card.rareza === filters.rareza);
    }

    switch (filters.sortBy) {
      case 'precio-asc':
        cards.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio-desc':
        cards.sort((a, b) => b.precio - a.precio);
        break;
      case 'nombre-asc':
        cards.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'nombre-desc':
        cards.sort((a, b) => b.nombre.localeCompare(a.nombre));
        break;
    }

    this.filteredCards = cards;
  }
  
  agregarAlCarrito(producto: Producto) {
    const resultado = this.carritoService.agregarProducto(producto);
    this.mostrarMensaje(resultado.message, resultado.success ? 'success' : 'error');
  }

  irAlCarrito() {
    this.router.navigate(['/carrito']);
  }
  
  private mostrarMensaje(texto: string, tipo: 'success' | 'error') {
    this.mensaje = { texto, tipo };
    setTimeout(() => {
      this.mensaje = null;
    }, 3000);
  }
}