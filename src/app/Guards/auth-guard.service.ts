import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.authService.rehydrateSession();
    if (user) {
      return true; // El usuario está autenticado
    } else {
      this.router.navigate(['/login']); // Redirigir a la página de login
      return false;
    }
  }
}