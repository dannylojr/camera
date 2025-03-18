import { Component, type OnDestroy } from "@angular/core"
import type { Subscription } from "rxjs"
import { LinkPeopleService } from "../../Services/link-people.service"
import { ToastService } from "../../Services/toast.service"
import { NgIf } from "@angular/common"
import { FormsModule } from "@angular/forms"

@Component({
  selector: "app-link-people",
  imports: [NgIf, FormsModule],
  templateUrl: "./link-people.component.html",
  styleUrls: ["./link-people.component.scss"],
})
export class LinkPeopleComponent implements OnDestroy {
  // Modelo para el formulario
  email = ""

  // Estados
  isLoading = false
  errorMessage = ""
  successMessage = ""

  // Suscripciones
  private subscription: Subscription | null = null

  constructor(
    private linkPeopleService: LinkPeopleService,
    private toastService: ToastService,
  ) { }

  ngOnDestroy(): void {
    // Limpiar suscripciones al destruir el componente
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  onSubmit(): void {
    // Resetear mensajes
    this.errorMessage = ""
    this.successMessage = ""

    // Validar email
    if (!this.email || !this.isValidEmail(this.email)) {
      this.errorMessage = "Por favor, ingresa un correo electrónico válido"
      return
    }

    // Establecer estado de carga
    this.isLoading = true

    // Buscar el ID del usuario por email
    this.subscription = this.linkPeopleService.getUserIdByEmail(this.email).subscribe({
      next: (userId) => {
        if (!userId) {
          this.errorMessage = "No se encontró ningún usuario con ese correo electrónico"
          this.toastService.showError(this.errorMessage)
          this.isLoading = false
          return
        }

        // Enviar la solicitud de enlace
        this.sendLinkRequest(userId)
      },
      error: (error) => {
        this.errorMessage = "Error al buscar el usuario: " + (error.message || "Error desconocido")
        this.toastService.showError(this.errorMessage)
        this.isLoading = false
      },
    })
  }

  private sendLinkRequest(userId: string): void {
    this.subscription = this.linkPeopleService.sendLinkRequest(userId).subscribe({
      next: (result) => {
        this.successMessage = "Solicitud de enlace enviada correctamente"
        this.toastService.showSuccess(this.successMessage)
        this.email = "" // Limpiar el formulario
        this.isLoading = false
      },
      error: (error) => {
        this.errorMessage = error.message || "Error al enviar la solicitud de enlace"
        this.toastService.showError(this.errorMessage)
        this.isLoading = false
      },
    })
  }

  // Validador simple de email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }
}

