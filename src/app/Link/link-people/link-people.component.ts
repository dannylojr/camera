import { Component, OnInit } from '@angular/core';
import { LinkPeopleService } from '../../Services/link-people.service';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-link-people',
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule],
  templateUrl: './link-people.component.html',
  styleUrls: ['./link-people.component.css']
})
export class LinkPeopleComponent implements OnInit {
  recipientEmail: string = ''; // Correo del receptor (cambiado de ID a correo)
  errorMessage: string = ''; // Mensaje de error
  successMessage: string = ''; // Mensaje de éxito
  loading: boolean = false; // Indicador de carga
  currentUser: any; // Usuario autenticado

  constructor(
    private linkService: LinkPeopleService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.checkAuthentication(); // Verificar autenticación al inicializar el componente
  }

  // Verificar si el usuario está autenticado
  checkAuthentication() {
    this.currentUser = this.authService.auth.currentUser;
    if (!this.currentUser) {
      // Si no hay usuario autenticado, redirigir a login
      this.router.navigate(['/login']);
    }
  }

  // Enviar solicitud de enlace usando correo electrónico
  sendLink() {
    this.errorMessage = ''; // Limpiar mensaje de error antes de intentar enviar el enlace
    this.successMessage = ''; // Limpiar mensaje de éxito
    this.loading = true; // Activar indicador de carga

    if (!this.recipientEmail) {
      this.errorMessage = 'Por favor ingresa el correo electrónico del receptor.';
      this.loading = false;
      return;
    }

    // Validar formato de correo electrónico
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.recipientEmail)) {
      this.errorMessage = 'Por favor ingresa un correo electrónico válido.';
      this.loading = false;
      return;
    }

    // Validar que no sea el mismo usuario
    if (this.currentUser.email === this.recipientEmail) {
      this.errorMessage = 'No puedes enlazarte contigo mismo.';
      this.loading = false;
      return;
    }

    // Usar el servicio para buscar el usuario por correo y luego enviar la solicitud
    this.linkService.getUserIdByEmail(this.recipientEmail)
      .subscribe({
        next: (recipientId) => {
          if (!recipientId) {
            this.errorMessage = 'No se encontró ningún usuario con ese correo electrónico.';
            this.loading = false;
            return;
          }

          // Ahora enviamos la solicitud con el ID obtenido
          this.linkService.sendLinkRequest(this.currentUser.uid, recipientId)
            .subscribe({
              next: () => {
                this.successMessage = 'Solicitud de enlace enviada correctamente. Esperando aceptación del destinatario.';
                this.loading = false;

                // Opcionalmente, redirigir a una página donde el usuario pueda ver sus solicitudes pendientes
                setTimeout(() => {
                  this.router.navigate(['/link-requests']);
                }, 1500);
              },
              error: (error) => {
                console.error('Error al enviar el enlace:', error);
                this.errorMessage = error.message || 'Hubo un error al enviar el enlace. Intenta de nuevo.';
                this.loading = false;
              }
            });
        },
        error: (error) => {
          console.error('Error al buscar el usuario:', error);
          this.errorMessage = 'Error al buscar el usuario. Verifica el correo e intenta de nuevo.';
          this.loading = false;
        }
      });
  }

  // Navegar a la página de solicitudes de enlace
  viewLinkRequests() {
    this.router.navigate(['/link-requests']);
  }

  // Limpiar los campos y mensajes
  resetForm() {
    this.recipientEmail = '';
    this.errorMessage = '';
    this.successMessage = '';
  }
}