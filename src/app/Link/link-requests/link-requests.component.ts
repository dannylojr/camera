import { Component, OnInit, inject, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { NgFor, NgIf, DatePipe, CommonModule } from "@angular/common";
import { AuthService } from "../../Services/auth.service";
import { LinkPeopleService } from "../../Services/link-people.service";
import { Link } from "../../Models/link.mode";
import { User } from "../../Models/user.mode";
import { Subscription } from "rxjs";

@Component({
  selector: "app-link-requests",
  standalone: true,
  imports: [CommonModule, NgFor, NgIf],
  templateUrl: "./link-requests.component.html",
  styleUrls: ["./link-requests.component.css"]
})
export class LinkRequestsComponent implements OnInit, OnDestroy {
  receivedRequests: Link[] = [];
  sentRequests: Link[] = [];
  userMap: Map<string, User> = new Map();
  loadingReceived: boolean = true;
  loadingSent: boolean = true;
  errorMessage: string = "";
  successMessage: string = "";

  private subscriptions: Subscription[] = [];
  private authService = inject(AuthService);
  private linkService = inject(LinkPeopleService);
  public router = inject(Router);

  ngOnInit() {
    // Cargar solicitudes cuando el usuario está autenticado
    const authSub = this.authService.user$.subscribe(user => {
      if (!user) {
        this.router.navigate(["/login"]);
        return;
      }

      this.loadRequests();
    });

    this.subscriptions.push(authSub);
  }

  ngOnDestroy() {
    // Limpiar todas las suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadRequests() {
    // Cargar solicitudes recibidas
    const receivedSub = this.linkService.getReceivedRequests().subscribe(requests => {
      this.receivedRequests = requests.filter(req => req.status === "pending");
      this.loadingReceived = false;

      // Cargar información de los usuarios
      requests.forEach(request => {
        this.loadUserInfo(request.senderId);
      });
    });

    // Cargar solicitudes enviadas
    const sentSub = this.linkService.getSentRequests().subscribe(requests => {
      this.sentRequests = requests.filter(req => req.status === "pending");
      this.loadingSent = false;

      // Cargar información de los usuarios
      requests.forEach(request => {
        this.loadUserInfo(request.recipientId);
      });
    });

    this.subscriptions.push(receivedSub, sentSub);
  }

  loadUserInfo(userId: string) {
    if (this.userMap.has(userId)) return;

    const userSub = this.linkService.getUserInfo(userId).subscribe(user => {
      if (user) {
        this.userMap.set(userId, user);
      }
    });

    this.subscriptions.push(userSub);
  }

  acceptRequest(request: Link) {
    this.linkService.acceptRequest(request.id, request.senderId).subscribe({
      next: () => {
        this.showSuccessMessage(`Solicitud de ${this.getUserName(request.senderId)} aceptada.`);
        // Actualizar la lista de solicitudes
        this.receivedRequests = this.receivedRequests.filter(req => req.id !== request.id);
      },
      error: (error) => {
        this.errorMessage = `Error al aceptar solicitud: ${error.message}`;
      }
    });
  }

  rejectRequest(request: Link) {
    this.linkService.rejectRequest(request.id).subscribe({
      next: () => {
        this.showSuccessMessage(`Solicitud de ${this.getUserName(request.senderId)} rechazada.`);
        // Actualizar la lista de solicitudes
        this.receivedRequests = this.receivedRequests.filter(req => req.id !== request.id);
      },
      error: (error) => {
        this.errorMessage = `Error al rechazar solicitud: ${error.message}`;
      }
    });
  }

  cancelRequest(request: Link) {
    this.linkService.cancelRequest(request.id).subscribe({
      next: () => {
        this.showSuccessMessage(`Solicitud a ${this.getUserName(request.recipientId)} cancelada.`);
        // Actualizar la lista de solicitudes
        this.sentRequests = this.sentRequests.filter(req => req.id !== request.id);
      },
      error: (error) => {
        this.errorMessage = `Error al cancelar solicitud: ${error.message}`;
      }
    });
  }

  resendRequest(request: Link) {
    this.linkService.resendRequest(request.id).subscribe({
      next: () => {
        this.showSuccessMessage(`Solicitud a ${this.getUserName(request.recipientId)} reenviada.`);
      },
      error: (error) => {
        this.errorMessage = `Error al reenviar solicitud: ${error.message}`;
      }
    });
  }

  getUserName(userId: string): string {
    return this.userMap.get(userId)?.displayName || "Usuario";
  }

  getUserPhoto(userId: string): string {
    return this.userMap.get(userId)?.photoURL || "/assets/default-avatar.png";
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return `hace ${diffDay} ${diffDay === 1 ? "día" : "días"}`;
    } else if (diffHour > 0) {
      return `hace ${diffHour} ${diffHour === 1 ? "hora" : "horas"}`;
    } else if (diffMin > 0) {
      return `hace ${diffMin} ${diffMin === 1 ? "minuto" : "minutos"}`;
    } else {
      return "hace unos segundos";
    }
  }

  navigateToUserProfile(userId: string) {
    // Implementar navegación al perfil del usuario
    console.log(`Navegar al perfil del usuario: ${userId}`);
  }

  showSuccessMessage(message: string) {
    this.successMessage = message;
    this.errorMessage = "";
    setTimeout(() => this.successMessage = "", 5000);
  }
}
