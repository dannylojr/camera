import { Component, OnInit, inject } from '@angular/core';
import { CameraService } from '../Services/camera.service';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

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
  linkId: string | null = null; // Almacena el linkId

  constructor(private aroute: ActivatedRoute) { }

  ngOnInit() {
    // Obtener el linkId de la ruta
    this.aroute.paramMap.subscribe(params => {
      this.linkId = params.get('id'); // Obtener el linkId de la ruta
    });
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
      }, 0); // Esperar un ciclo de detección de cambios de Angular

      setTimeout(() => {
        this.showPhoto = false; // Ocultar la foto después de 4 segundos
      }, 4000);

      // Compartir la foto con el usuario enlazado
      if (this.linkId) {
        await this.cameraService.captureAndSharePhoto(this.linkId, 'Descripción opcional').toPromise();
      }

    } catch (error) {
      console.error('Error al capturar imagen:', error);
      this.errorMessage = String(error); // Mostrar mensaje de error
    } finally {
      this.loading = false; // Habilitar el botón nuevamente
    }
  }

  gotoGaleria() {
    if (this.linkId) {
      // Redirigir a la galería con el linkId
      this.route.navigate(['/galeria', this.linkId]);
    } else {
      console.error('No se encontró el linkId para redirigir a la galería.');
    }
  }
}