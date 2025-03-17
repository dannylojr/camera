import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.authService.rehydrateSession();
    if (!user) {
      return true; // El usuario no está autenticado
    } else {
      this.router.navigate(['/link-people']); // Redirigir a la página de enlace
      return false;
    }
  }
}