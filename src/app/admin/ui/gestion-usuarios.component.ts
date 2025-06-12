// file_path: src/app/admin/ui/gestion-usuarios/gestion-usuarios.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GestionUsuariosService } from '../data-access/gestion-usuarios.service';
import { UsuarioAdmin } from '../interfaces/usuario-admin.interface';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-usuarios.component.html',
  styleUrls: ['./gestion-usuarios.component.scss']
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: UsuarioAdmin[] = [];
  isLoading = true;
  mensaje: { texto: string, tipo: 'success' | 'error' } | null = null;

  constructor(private gestionUsuariosService: GestionUsuariosService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  async cargarUsuarios() {
    this.isLoading = true;
    try {
      this.usuarios = await this.gestionUsuariosService.obtenerUsuarios();
    } catch (error) {
      this.mostrarMensaje('Error al cargar la lista de usuarios', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async guardarRol(usuario: UsuarioAdmin) {
    try {
      await this.gestionUsuariosService.actualizarRol(usuario.id_usuario, usuario.rol);
      this.mostrarMensaje(`Rol de ${usuario.nombre} actualizado con éxito`, 'success');
    } catch (error) {
      this.mostrarMensaje('Error al actualizar el rol', 'error');
      this.cargarUsuarios();
    }
  }
  
  private mostrarMensaje(texto: string, tipo: 'success' | 'error') {
    this.mensaje = { texto, tipo };
    setTimeout(() => {
      this.mensaje = null;
    }, 3000);
  }
}