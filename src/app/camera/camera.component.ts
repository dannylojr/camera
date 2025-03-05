import { Component, OnInit, inject } from '@angular/core';
import { CameraService } from '../camera.service';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-camera',
  imports: [NgIf],
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.css']
})
export class CameraComponent implements OnInit {
  route = inject(Router);
  cameraService: CameraService = inject(CameraService);
  imgUrl: string = ''; // URL de la imagen capturada
  errorMessage: string = ''; // Mensaje de error
  loading: boolean = false; // Estado de carga
  images: string[] = []; // Almacena las imágenes capturadas
  showPhoto: boolean = false; // Controla si la foto se muestra
  lastSavedImage: string = ''; // Última imagen guardada en localStorage

  constructor() { }

  ngOnInit() {
    // Recuperar la última imagen guardada de localStorage
    this.lastSavedImage = localStorage.getItem('lastCapturedImage') || '';
  }

  async takePicture() {
    this.errorMessage = ''; // Reiniciar mensaje de error
    this.loading = true; // Deshabilitar el botón mientras se procesa

    // Animación del flash
    const light = document.getElementById('circle');
    if (light) {
      light.classList.remove('flash-animation');
      setTimeout(() => {
        light.classList.add('flash-animation');
      }, 10); // Pequeño retraso para reiniciar la animación
    }

    try {
      // Capturar la imagen usando el servicio
      const newImage = await this.cameraService.takePicture();
      if (!newImage) throw new Error('No se obtuvo una imagen válida');

      // Guardar la imagen en localStorage
      localStorage.setItem('lastCapturedImage', newImage);
      this.lastSavedImage = newImage;

      // Agregar la nueva imagen al inicio del array
      this.images.unshift(newImage);
      this.imgUrl = newImage; // Mostrar la última imagen capturada
      this.showPhoto = true; // Mostrar la foto

      // Esperar a que el elemento #photo esté en el DOM
      setTimeout(() => {
        const eject = document.getElementById('photo');
        if (eject) {
          eject.classList.remove('eject-photo');
          setTimeout(() => {
            eject.classList.add('eject-photo');
          }, 10); // Pequeño retraso para reiniciar la animación
        }
      }, 0);// Esperar un ciclo de detección de cambios de Angular

      setTimeout(() => {
        this.showPhoto = false; // Ocultar la foto después de 6 segundos
      }, 4000);
      
    } catch (error) {
      console.error('Error al capturar imagen:', error);
      this.errorMessage = String(error); // Mostrar mensaje de error
    } finally {
      this.loading = false; // Habilitar el botón nuevamente
    }
  }

  gotoGaleria() {
    this.route.navigateByUrl('/galeria');
  }
}