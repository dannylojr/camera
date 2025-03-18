import { Component, OnInit, inject, OnDestroy } from "@angular/core";
import { LinkPeopleService } from "../../Services/link-people.service";
import { AuthService } from "../../Services/auth.service";
import { Router } from "@angular/router";
import { NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { finalize } from "rxjs/operators";
import { Subscription } from "rxjs";

@Component({
  selector: "app-link-people",
  standalone: true,
  imports: [CommonModule, NgIf, FormsModule],
  templateUrl: "./link-people.component.html",
  styleUrls: ["./link-people.component.css"]
})
export class LinkPeopleComponent implements OnInit, OnDestroy {
  recipientEmail: string = "";
  errorMessage: string = "";
  successMessage: string = "";
  loading: boolean = false;

  private subscriptions: Subscription[] = [];
  private linkService = inject(LinkPeopleService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    // Verificar autenticación al inicializar el componente
    const authSub = this.authService.user$.subscribe(user => {
      if (!user) {
        this.router.navigate(["/login"]);
      }
    });

    this.subscriptions.push(authSub);
  }

  ngOnDestroy() {
    // Limpiar todas las suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Enviar solicitud de enlace usando correo electrónico
  sendLink() {
    this.errorMessage = "";
    this.successMessage = "";
    this.loading = true;

    if (!this.recipientEmail) {
      this.errorMessage = "Por favor ingresa el correo electrónico del receptor.";
      this.loading = false;
      return;
    }

    // Validar formato de correo electrónico
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.recipientEmail)) {
      this.errorMessage = "Por favor ingresa un correo electrónico válido.";
      this.loading = false;
      return;
    }

    // Validar que no sea el mismo usuario
    const authSub = this.authService.user$.subscribe(user => {
      if (user?.email === this.recipientEmail) {
        this.errorMessage = "No puedes enlazarte contigo mismo.";
        this.loading = false;
        return;
      }

      // Buscar el usuario por correo y enviar la solicitud
      const emailSub = this.linkService.getUserIdByEmail(this.recipientEmail)
        .pipe(
          finalize(() => this.loading = false)
        )
        .subscribe({
          next: (recipientId) => {
            if (!recipientId) {
              this.errorMessage = "No se encontró ningún usuario con ese correo electrónico.";
              return;
            }

            // Enviar la solicitud con el ID obtenido
            const linkSub = this.linkService.sendLinkRequest(recipientId)
              .subscribe({
                next: () => {
                  this.successMessage = "Solicitud de enlace enviada correctamente. Esperando aceptación del destinatario.";

                  // Redirigir a la página de solicitudes pendientes
                  setTimeout(() => {
                    this.router.navigate(["/link-requests"]);
                  }, 1500);
                },
                error: (error) => {
                  console.error("Error al enviar el enlace:", error);
                  this.errorMessage = error.message || "Hubo un error al enviar el enlace. Intenta de nuevo.";
                }
              });

            this.subscriptions.push(linkSub);
          },
          error: (error) => {
            console.error("Error al buscar el usuario:", error);
            this.errorMessage = "Error al buscar el usuario. Verifica el correo e intenta de nuevo.";
          }
        });

      this.subscriptions.push(emailSub);
    });

    this.subscriptions.push(authSub);
  }

  // Navegar a la página de solicitudes de enlace
  viewLinkRequests() {
    this.router.navigate(["/link-requests"]);
  }

  // Limpiar los campos y mensajes
  resetForm() {
    this.recipientEmail = "";
    this.errorMessage = "";
    this.successMessage = "";
  }
}
