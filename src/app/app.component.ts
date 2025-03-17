import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './Services/auth.service';
import { LinkPeopleService } from './Services/link-people.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'myapp';
  constructor(private authService: AuthService) {
    const user = this.authService.rehydrateSession();
    if (user) {
      console.log('Usuario rehidratado:', user);
    } else {
      console.log('No hay usuario autenticado');
    }
  }
}
