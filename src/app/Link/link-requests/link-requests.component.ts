import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../Services/auth.service';
import { LinkPeopleService } from '../../Services/link-people.service';
import { Link } from '../../Models/link.mode';
import { User } from '../../Models/user.mode';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-link-requests',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './link-requests.component.html',
  styleUrls: ['./link-requests.component.css']
})
export class LinkRequestsComponent implements OnInit {
  currentUser: User | null = null;
  receivedRequests$: Observable<Link[]> | null = null;
  userMap: Map<string, User> = new Map();
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private linkService: LinkPeopleService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      if (!this.currentUser) {
        this.router.navigate(['/login']);
        return;
      }
      this.loadReceivedRequests();
    });
  }

  loadReceivedRequests() {
    if (!this.currentUser?.uid) return;
    this.loading = true;
    this.errorMessage = '';

    this.receivedRequests$ = this.linkService.getReceivedRequests().pipe(
      map(requests => {
        requests.forEach(request => this.loadUserInfo(request.senderId));
        return requests;
      })
    );
    this.loading = false;
  }

  async loadUserInfo(userId: string) {
    if (this.userMap.has(userId)) return;
    try {
      const userRef = await this.linkService.getLinkedUser().toPromise();
      if (userRef) this.userMap.set(userId, { uid: userId, displayName: userRef } as User);
    } catch (error) {
      console.error(`Error al cargar información del usuario ${userId}:`, error);
    }
  }

  acceptRequest(request: Link) {
    this.linkService.acceptRequest(request.id, request.senderId).then(() => {
      this.showSuccessMessage(`Solicitud de ${this.getUserName(request.senderId)} aceptada.`);
    }).catch(error => {
      this.errorMessage = `Error al aceptar solicitud: ${error.message}`;
    });
  }

  rejectRequest(request: Link) {
    this.linkService.rejectRequest(request.id).then(() => {
      this.showSuccessMessage(`Solicitud de ${this.getUserName(request.senderId)} rechazada.`);
    }).catch(error => {
      this.errorMessage = `Error al rechazar solicitud: ${error.message}`;
    });
  }

  getUserName(userId: string): string {
    return this.userMap.get(userId)?.displayName || 'Usuario desconocido';
  }

  showSuccessMessage(message: string) {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.successMessage = '', 5000);
  }
}