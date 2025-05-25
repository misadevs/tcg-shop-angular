import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../../shared/services/supabase.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-request-password-reset',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './request-password-reset.component.html',
  styleUrls: ['./request-password-reset.component.scss']
})
export class RequestPasswordResetComponent {
  form: FormGroup;
  message: string | null = null;
  error: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private supabase: SupabaseService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async requestPasswordReset() {
    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;
    this.message = null;
    this.error = null;

    try {
      const { email } = this.form.value;
      const { error } = await this.supabase.client.auth.resetPasswordForEmail(email!, {
        redirectTo: window.location.origin + '/update-password' // URL to redirect to after email link click
      });

      if (error) {
        this.error = error.message;
      } else {
        this.message = 'Si tu correo está registrado, recibirás un email para reestablecer tu contraseña.';
        this.form.reset();
      }
    } catch (err: any) {
      this.error = err.message || 'Ocurrió un error al solicitar el cambio de contraseña.';
    } finally {
      this.isLoading = false;
    }
  }
} 