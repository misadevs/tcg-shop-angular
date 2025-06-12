// file_path: src/app/admin/data-access/gestion-usuarios.service.ts
import { Injectable } from '@angular/core';
import { SupabaseService } from '../../shared/services/supabase.service';
import { UsuarioAdmin } from '../interfaces/usuario-admin.interface';

@Injectable({
  providedIn: 'root'
})
export class GestionUsuariosService {

  constructor(private supabase: SupabaseService) { }

  async obtenerUsuarios(): Promise<UsuarioAdmin[]> {
    const { data, error } = await this.supabase.client
      .from('usuario')
      .select('id_usuario, nombre, correo, rol');

    if (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
    return data as UsuarioAdmin[];
  }

  async actualizarRol(id_usuario: number, nuevoRol: 'admin' | 'cliente'): Promise<UsuarioAdmin> {
    const { data, error } = await this.supabase.client
      .from('usuario')
      .update({ rol: nuevoRol })
      .eq('id_usuario', id_usuario)
      .select()
      .single();

    if (error) {
      console.error('Error al actualizar el rol:', error);
      throw error;
    }
    return data as UsuarioAdmin;
  }
}