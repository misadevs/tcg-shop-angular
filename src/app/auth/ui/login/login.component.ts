import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginService } from '../../data-access/login.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form: FormGroup;
  error: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: [''],
      password: ['']
    });
  }

  async login() {
    if (this.form.invalid) {
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    
    try {
      const { email, password } = this.form.value;
      const { user, error } = await this.loginService.login(email!, password!);
      
      if (error) {
        this.error = error.message;
      } else {
        this.router.navigate(['/']);
      }
    } catch (err: any) {
      this.error = err.message || 'Ocurrió un error durante el inicio de sesión';
    } finally {
      this.isLoading = false;
    }
  }
}
