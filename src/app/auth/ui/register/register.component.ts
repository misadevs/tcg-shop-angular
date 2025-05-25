import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegisterService } from '../../data-access/register.service';
import { SupabaseService } from '../../../shared/services/supabase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form: FormGroup;
  error: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private registerService: RegisterService,
    private supabase: SupabaseService,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: [''],
      email: [''],
      password: ['']
    });
  }

  async register() {
    if (this.form.invalid) {
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    
    try {
      const { nombre, email, password } = this.form.value;
      const { user, error } = await this.registerService.register(email!, password!, nombre!);
      
      if (error) {
        this.error = error.message;
      } else if (user) {
        // Crea el usuario en la tabla usuario
        await this.supabase.client.from('usuario').insert({
          google_id: user.id,
          nombre,
          correo: email,
          rol: 'cliente'
        });
        this.router.navigate(['/login']);
      }
    } catch (err: any) {
      this.error = err.message || 'Ocurrió un error durante el registro';
    } finally {
      this.isLoading = false;
    }
  }
}
