export interface UsuarioAdmin {
    id_usuario: number;
    nombre: string;
    correo: string;
    rol: 'admin' | 'cliente';
  }