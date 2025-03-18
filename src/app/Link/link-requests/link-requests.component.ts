import { Component, type OnInit, type OnDestroy } from "@angular/core"
import type { Subscription } from "rxjs"
import type { Link } from "../../Models/link.mode"
import { LinkPeopleService } from "../../Services/link-people.service"
import { ToastService } from "../../Services/toast.service"
import { NgClass, NgFor, NgIf } from "@angular/common"

@Component({
  selector: "app-link-requests",
  imports: [NgIf, NgFor, NgClass],
  templateUrl: "./link-requests.component.html",
  styleUrls: ["./link-requests.component.scss"],
})
export class LinkRequestsComponent implements OnInit, OnDestroy {
  receivedRequests: Link[] = []
  sentRequests: Link[] = []
  private receivedSub: Subscription | null = null
  private sentSub: Subscription | null = null
  isLoading = true

  constructor(
    private linkPeopleService: LinkPeopleService,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {
    this.loadRequests()
  }

  ngOnDestroy(): void {
    if (this.receivedSub) {
      this.receivedSub.unsubscribe()
    }
    if (this.sentSub) {
      this.sentSub.unsubscribe()
    }
  }

  loadRequests(): void {
    this.isLoading = true

    this.receivedSub = this.linkPeopleService.getReceivedRequests().subscribe((requests) => {
      this.receivedRequests = requests
      this.isLoading = false
    })

    this.sentSub = this.linkPeopleService.getSentRequests().subscribe((requests) => {
      this.sentRequests = requests
      this.isLoading = false
    })
  }

  acceptRequest(requestId: string, senderId: string): void {
    this.linkPeopleService.acceptRequest(requestId, senderId).subscribe({
      next: () => {
        this.toastService.showSuccess("Solicitud aceptada correctamente")
      },
      error: (error:any) => {
        this.toastService.showError(error.message || "Error al aceptar la solicitud")
      },
    })
  }

  rejectRequest(requestId: string): void {
    this.linkPeopleService.rejectRequest(requestId).subscribe({
      next: () => {
        this.toastService.showSuccess("Solicitud rechazada")
      },
      error: (error:any) => {
        this.toastService.showError(error.message || "Error al rechazar la solicitud")
      },
    })
  }

  cancelRequest(requestId: string): void {
    this.linkPeopleService.cancelRequest(requestId).subscribe({
      next: () => {
        this.toastService.showSuccess("Solicitud cancelada")
      },
      error: (error:any) => {
        this.toastService.showError(error.message || "Error al cancelar la solicitud")
      },
    })
  }

  resendRequest(requestId: string): void {
    this.linkPeopleService.resendRequest(requestId).subscribe({
      next: () => {
        this.toastService.showSuccess("Solicitud reenviada")
      },
      error: (error:any) => {
        this.toastService.showError(error.message || "Error al reenviar la solicitud")
      },
    })
  }
}

