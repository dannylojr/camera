import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedGalleryService } from '../Services/gallery-shared.service';
import { SharedPhoto } from '../Models/sharedphoto';
import { LinkPeopleService } from '../Services/link-people.service';
import { AuthService } from '../Services/auth.service';
import { BehaviorSubject, Observable, switchMap, filter, from } from 'rxjs';

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule],
  templateUrl: './galeria.component.html',
  styleUrls: ['./galeria.component.css']
})
export class GaleriaComponent implements OnInit {
  private sharedGalleryService: SharedGalleryService = inject(SharedGalleryService);
  private authService: AuthService = inject(AuthService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);

  currentUser$: BehaviorSubject<any> = new BehaviorSubject<any>(null); // Almacenar usuario como Observable
  images$: BehaviorSubject<SharedPhoto[]> = new BehaviorSubject<SharedPhoto[]>([]); // Usar Observable para mejorar rendimiento
  linkedUserId: string | null = null; // Almacenar el linkedUserId

  ngOnInit(): void {
    // Obtener el usuario actual y cargar las fotos compartidas
    from(this.authService.getCurrentUser()).subscribe(user => {
      this.currentUser$.next(user);
      this.linkedUserId = user?.uid || null; // Asignar el linkedUserId del usuario actual
    });

    // Obtener el linkedUserId desde la ruta y cargar las fotos asociadas a ese linkedUserId
    this.route.paramMap.pipe(
      switchMap(params => {
        this.linkedUserId = params.get('id');
        return from(this.authService.getCurrentUser()); // Convertimos la promesa en Observable
      }),
      filter(user => !!user && !!this.linkedUserId)
    ).subscribe(user => {
      this.loadSharedPhotos();
    });
  }

  // Método para cargar las fotos compartidas con el linkedUserId
  loadSharedPhotos() {
    if (this.linkedUserId) {
      this.sharedGalleryService.getSharedPhotosByLinkedUserId(this.linkedUserId).subscribe(photos => {
        this.images$.next(photos); // Asignar las fotos al BehaviorSubject
      });
    }
  }

  // Eliminar una foto de la galería
  deleteImage(imageId: string) {
    this.sharedGalleryService.deletePhoto(imageId).subscribe({
      next: () => {
        console.log('Imagen eliminada correctamente');
        this.refreshGallery(); // Actualizar la galería después de eliminar la foto
      },
      error: error => console.error('Error al eliminar la imagen:', error)
    });
  }

  // Refrescar la galería después de eliminar una imagen
  refreshGallery() {
    this.loadSharedPhotos(); // Recargar las fotos después de eliminar
  }

  // Navegar a la cámara
  gotoCamera() {
    this.router.navigateByUrl('/camera');
  }

  // Navegar a la cámara compartida con el linkedUserId
  navigateToSharedCamera() {
    if (this.linkedUserId) {
      this.router.navigate(['/camera', this.linkedUserId]);
    } else {
      console.warn('No se puede acceder a la cámara compartida sin un linkedUserId');
    }
  }
}
