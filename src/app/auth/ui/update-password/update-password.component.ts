import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../../shared/services/supabase.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss']
})
export class UpdatePasswordComponent {
  form: FormGroup;
  message: string | null = null;
  error: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async updatePassword() {
    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;
    this.message = null;
    this.error = null;

    try {
      const { password } = this.form.value;
      const { error } = await this.supabase.client.auth.updateUser({ password });

      if (error) {
        this.error = error.message;
      } else {
        this.message = 'Tu contraseña ha sido actualizada exitosamente. Serás redirigido al login.';
        this.form.reset();
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      }
    } catch (err: any) {
      this.error = err.message || 'Ocurrió un error al actualizar la contraseña.';
    } finally {
      this.isLoading = false;
    }
  }
} 