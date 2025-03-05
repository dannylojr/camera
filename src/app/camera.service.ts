import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, PermissionStatus } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private images: string[] = []; // Almacena las imágenes

  constructor() {
    this.loadImages(); // Cargar imágenes guardadas
  }

  private async checkPermissions(): Promise<void> {
    const check = async (permission: PermissionStatus): Promise<boolean> => {
      if (permission.camera !== 'granted' || permission.photos !== 'granted') {
        const request = await Camera.requestPermissions();
        return request.camera === 'granted' && request.photos === 'granted';
      }
      return true;
    };

    const permissions = await Camera.checkPermissions();
    if (!(await check(permissions))) {
      throw new Error('Permisos de cámara no otorgados');
    }
  }

  async takePicture(): Promise<string> {
    await this.checkPermissions();
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera
    });

    const base64Image = `data:image/jpeg;base64,${image.base64String}`;

  if (base64Image) {
    this.images.push(base64Image); // Guardar en el array de imágenes
    this.saveImages(); // Guardar en localStorage
    return base64Image;
  } else {
    throw new Error("Error al capturar la imagen");
  }
  }

  private saveImages(): void {
    localStorage.setItem('images', JSON.stringify(this.images));
  }

  private loadImages(): void {
    const storedImages = localStorage.getItem('images');
    this.images = storedImages ? JSON.parse(storedImages) : [];
  }
  

  getImages(): string[] {
    return [...this.images]; // Retorna una copia del array
  }

  deleteImage(index: number): void {
    if (index >= 0 && index < this.images.length) {
      this.images.splice(index, 1); // Eliminar la imagen del array
      this.saveImages(); // Guardar los cambios en localStorage
    }
  }
}
