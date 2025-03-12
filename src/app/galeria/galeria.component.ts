import { NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CameraService } from '../camera.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-galeria',
  imports: [NgIf, NgFor],
  templateUrl: './galeria.component.html',
  styleUrl: './galeria.component.css'
})
export class GaleriaComponent {

  route = inject(Router);
  cameraService: CameraService = inject(CameraService);
  images: string[] = []; // Almacena las imágenes


  constructor() {
    this.loadSavedImages(); // Cargar imágenes al iniciar
  }

  private loadSavedImages() {
    this.images = this.cameraService.getImages(); // Obtener imágenes guardadas
  }

  deleteImage(index: number) {
    this.cameraService.deleteImage(index);
  }

  gotoCamera() {
    this.route.navigateByUrl('/camera');
  }

  items!: NodeListOf<HTMLElement>; // Usamos el operador '!' para indicar que se inicializará más tarde

  ngAfterViewInit(): void {
    // Inicializa 'items' después de que la vista se haya inicializado
    this.items = document.querySelectorAll('.item');
    // Itera sobre cada elemento
    this.items.forEach((item: HTMLElement): void => {
      // Agrega un evento de clic a cada elemento
      item.addEventListener('click', () => {
        // Primero, elimina la clase 'selected' de todos los elementos
        this.items.forEach((i: HTMLElement) => {
          i.classList.remove('selected');
        });
        // Luego, agrega la clase 'selected' al elemento que fue clicado
        item.classList.add('selected');
      });
    });
  }
}
