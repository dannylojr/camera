import { Component } from '@angular/core';
import { AuthService } from '../../Services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = ''; // Para almacenar mensajes de error
  successMessage: string = ''; // Para almacenar mensajes de éxito

  constructor(private authService: AuthService, private router: Router) { }

  async onRegister() {
    this.errorMessage = ''; // Limpiar mensajes de error previos
    this.successMessage = ''; // Limpiar mensajes de éxito previos

    // Validar campos
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, ingrese su correo electrónico y contraseña.';
      return;
    }

    try {
      await this.authService.createAccount(this.email, this.password);
      this.successMessage = 'Cuenta creada con éxito. ¿Desea ir a la página de inicio de sesión?';
      this.clearForm(); // Limpiar el formulario
    } catch (error) {
      this.errorMessage = this.getErrorMessage(error); // Capturar y mostrar el mensaje de error
    }
  }

  // Método para limpiar el formulario
  private clearForm() {
    this.email = '';
    this.password = '';
  }

  // Método para obtener el mensaje de error
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message; // Si es una instancia de Error, devuelve el mensaje
    }
    return 'Ocurrió un error desconocido'; // Mensaje por defecto
  }

  // Método para redirigir a la página de inicio de sesión
  gotoLogin() {
    this.router.navigate(['/login']);
  }
}