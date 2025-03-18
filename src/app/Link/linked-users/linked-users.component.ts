import { Component, type OnInit, type OnDestroy } from "@angular/core"
import type { Subscription } from "rxjs"
import type { User } from "../../Models/user.mode"
import { LinkPeopleService } from "../../Services/link-people.service"
import { ToastService } from "../../Services/toast.service"
import { NgFor, NgIf } from "@angular/common"

@Component({
  selector: "app-linked-users",
  imports: [NgIf, NgFor],
  templateUrl: "./linked-users.component.html",
  styleUrls: ["./linked-users.component.scss"],
})
export class LinkedUsersComponent implements OnInit, OnDestroy {
  linkedUsers: User[] = []
  private linkedUsersSub: Subscription | null = null
  isLoading = true

  constructor(
    private linkPeopleService: LinkPeopleService,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {
    this.loadLinkedUsers()
  }

  ngOnDestroy(): void {
    if (this.linkedUsersSub) {
      this.linkedUsersSub.unsubscribe()
    }
  }

  loadLinkedUsers(): void {
    this.isLoading = true

    this.linkedUsersSub = this.linkPeopleService.loadLinkedUsers().subscribe({
      next: (users) => {
        this.linkedUsers = users
        this.isLoading = false
      },
      error: (error:any) => {
        this.toastService.showError("Error al cargar usuarios enlazados")
        this.isLoading = false
      },
    })
  }

  unlinkUser(userId: string): void {
    if (confirm("¿Estás seguro de que deseas eliminar este enlace?")) {
      this.linkPeopleService.unlinkUser(userId).subscribe({
        next: () => {
          this.toastService.showSuccess("Usuario desenlazado correctamente")
          // Actualizar la lista de usuarios enlazados
          this.loadLinkedUsers()
        },
        error: (error:any) => {
          this.toastService.showError(error.message || "Error al desenlazar usuario")
        },
      })
    }
  }
}

