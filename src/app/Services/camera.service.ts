import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, throwError, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { AuthService } from './auth.service';
import { SharedGalleryService } from './gallery-shared.service';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private processingPhotoSubject = new BehaviorSubject<boolean>(false);
  public processingPhoto$ = this.processingPhotoSubject.asObservable();

  constructor(
    private sharedGalleryService: SharedGalleryService,
    private authService: AuthService
  ) { }

  /**
   * Toma una foto usando la cámara del dispositivo y devuelve la URL de los datos de la imagen.
   */
  async takePicture(): Promise<string> {
    this.processingPhotoSubject.next(true);
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: 1280,
        height: 720,
      });
      return image.dataUrl || ''; // Devuelve la imagen en formato Data URL
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      throw error;
    } finally {
      this.processingPhotoSubject.next(false);
    }
  }

  /**
   * Captura una foto y la comparte en la galería de un usuario enlazado.
   * @param linkedUserId ID del usuario enlazado con el cual se compartirá la foto
   * @param linkId ID del enlace entre los usuarios
   * @param description Descripción opcional para la foto
   * @returns Observable con la URL de la foto compartida
   */
  captureAndSharePhoto(linkedUserId: string, linkId: string, description?: string): Observable<string> {
    return from(this.takePicture()).pipe(
      switchMap(imageDataUrl => {
        if (!imageDataUrl) {
          return throwError(() => new Error('No se pudo capturar la imagen'));
        }
        return from(this.authService.getCurrentUser()).pipe( // Convierte la Promise a Observable
          switchMap(user => {
            if (!user || !user.uid) {
              return throwError(() => new Error('Usuario no autenticado'));
            }
            // Llama al servicio de la galería para compartir la foto
            return this.sharedGalleryService.sharePhoto(
              user.uid,
              linkedUserId,
              imageDataUrl,
              user.displayName || 'Usuario',
              description
            );
          })
        );
      }),
      catchError(error => {
        console.error('Error en el proceso de captura y compartición:', error);
        return throwError(() => new Error(`Error en el proceso de captura y compartición: ${error.message}`));
      })
    );
  }
}
