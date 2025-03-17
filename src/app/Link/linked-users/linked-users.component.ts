import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { LinkPeopleService } from '../../Services/link-people.service';
import { NgFor, NgIf } from '@angular/common';
import { User } from '../../Models/user.mode';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

@Component({
  selector: 'app-linked-users',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './linked-users.component.html',
  styleUrls: ['./linked-users.component.css']
})
export class LinkedUsersComponent implements OnInit {
  currentUser: FirebaseUser | null = null;
  linkedUsers: User[] = [];
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private linkService: LinkPeopleService,
    public router: Router
  ) { }

  ngOnInit() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.currentUser = user;
        this.loadLinkedUsers();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  loadLinkedUsers() {
    if (!this.currentUser) return;

    this.loading = true;
    this.linkService.getLinkedUser().subscribe({
      next: (users) => {
        if (Array.isArray(users)) {
          this.linkedUsers = users;
        } else {
          this.linkedUsers = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = `Error al cargar los usuarios enlazados: ${error.message}`;
        this.loading = false;
      }
    });
  }

  navigateToSharedGallery(userId: string) {
    if (!this.currentUser) return;

    this.linkService.getLinkedUser().subscribe({
      next: (linkId) => {
        if (linkId) {
          this.router.navigate(['/galeria', linkId]);
        } else {
          console.error('No se encontró el linkId para el usuario:', userId);
        }
      },
      error: (error: any) => {
        console.error('Error al obtener el linkId:', error);
      }
    });
  }
}
