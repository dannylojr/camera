import { Component, inject } from '@angular/core';
import { AuthService } from '../../Services/auth.service';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  emailValid: boolean = true;
  passwordValid: boolean = true;
  route = inject(Router);

  constructor(private authService: AuthService) {
    this.checkAuthentication(); // Verificar si el usuario ya está autenticado
  }

  private async checkAuthentication() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.route.navigate(['/link-people']); // Redirigir si ya está autenticado
    }
  }

  async onLogin() {
    this.errorMessage = '';
    this.emailValid = this.validateEmail(this.email);
    this.passwordValid = this.validatePassword(this.password);

    if (this.emailValid && this.passwordValid) {
      try {
        await this.authService.signIn(this.email, this.password);
        this.route.navigate(['/link-people']); // Redirigir después de iniciar sesión
      } catch (error) {
        this.errorMessage = this.getErrorMessage(error);
      }
    } else {
      this.errorMessage = 'Por favor, ingrese un correo electrónico y una contraseña válidos.';
    }
  }

  async onGoogleLogin() {
    try {
      await this.authService.signInWithGoogle();
      this.route.navigate(['/link-people']); // Redirigir después de iniciar sesión
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error);
    }
  }

  private validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  private validatePassword(password: string): boolean {
    return password.length >= 6;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Ocurrió un error desconocido';
  }
}