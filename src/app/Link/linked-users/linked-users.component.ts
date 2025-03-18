import { Component, OnInit, inject, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../Services/auth.service";
import { LinkPeopleService } from "../../Services/link-people.service";
import { NgFor, NgIf, CommonModule } from "@angular/common";
import { User } from "../../Models/user.mode";
import { Subscription } from "rxjs";

@Component({
  selector: "app-linked-users",
  standalone: true,
  imports: [CommonModule, NgFor, NgIf],
  templateUrl: "./linked-users.component.html",
  styleUrls: ["./linked-users.component.css"]
})
export class LinkedUsersComponent implements OnInit, OnDestroy {
  linkedUsers: User[] = [];
  errorMessage: string = "";
  successMessage: string = "";
  loading: boolean = true;

  private subscriptions: Subscription[] = [];
  private authService = inject(AuthService);
  private linkService = inject(LinkPeopleService);
  public router = inject(Router);

  ngOnInit() {
    // Verificar autenticación y cargar usuarios enlazados
    const authSub = this.authService.user$.subscribe(user => {
      if (!user) {
        this.router.navigate(["/login"]);
        return;
      }

      this.loadLinkedUsers();
    });

    this.subscriptions.push(authSub);
  }

  ngOnDestroy() {
    // Limpiar todas las suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadLinkedUsers() {
    const linkedSub = this.linkService.loadLinkedUsers().subscribe({
      next: (users) => {
        this.linkedUsers = users;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = `Error al cargar los usuarios enlazados: ${error.message}`;
        this.loading = false;
      }
    });

    this.subscriptions.push(linkedSub);
  }

  unlinkUser(userId: string) {
    this.loading = true;

    const unlinkSub = this.linkService.unlinkUser(userId).subscribe({
      next: () => {
        this.successMessage = "Usuario desenlazado correctamente";
        this.linkedUsers = this.linkedUsers.filter(user => user.uid !== userId);
        this.loading = false;

        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
          this.successMessage = "";
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = `Error al desenlazar usuario: ${error.message}`;
        this.loading = false;
      }
    });

    this.subscriptions.push(unlinkSub);
  }

  navigateToSharedGallery(userId: string) {
    this.router.navigate(["/galeria", userId]);
  }
}
