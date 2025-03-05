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

  gotoCamera(){
    this.route.navigateByUrl('/camera');
  }
}
