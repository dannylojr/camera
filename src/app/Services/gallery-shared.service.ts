import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  Timestamp,
  orderBy,
  onSnapshot,
  getFirestore
} from 'firebase/firestore';
import { BehaviorSubject, Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../environments/firebase-config';
import { LinkPeopleService } from './link-people.service';
import { SharedPhoto } from '../Models/sharedphoto';

@Injectable({ providedIn: 'root' })
export class SharedGalleryService {
  private readonly firestore: Firestore;
  private readonly PHOTOS_COLLECTION = 'shared_photos';

  private sharedPhotosSubject = new BehaviorSubject<SharedPhoto[]>([]);

  constructor(private linkService: LinkPeopleService) {
    const app = initializeApp(firebaseConfig);
    this.firestore = getFirestore(app);
  }

  /**
   * Obtiene las fotos compartidas entre los usuarios filtradas por linkedUserId.
   * @param linkedUserId ID del usuario enlazado para obtener las fotos compartidas.
   * @returns Observable con una lista de fotos compartidas
   */
  getSharedPhotosByLinkedUserId(linkedUserId: string): Observable<SharedPhoto[]> {
    const photosRef = collection(this.firestore, this.PHOTOS_COLLECTION);
    return from(getDocs(query(photosRef, where('linkedUserId', '==', linkedUserId), orderBy('createdAt', 'desc')))).pipe(
      map(snapshot => snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          senderId: data['senderId'],
          linkedUserId: data['linkedUserId'],
          imageUrl: data['imageUrl'],
          senderName: data['senderName'],
          description: data['description'],
          createdAt: data['createdAt'],
          photoURL: data['photoURL'] || '',
          createdBy: data['createdBy'] || '',
          creatorName: data['creatorName'] || '',
          linkId: data['linkId'] || '',
        } as SharedPhoto;
      })),
      catchError(error => {
        console.error('Error al obtener fotos compartidas:', error);
        return throwError(() => error);
      })
    );
  }


  /**
   * Elimina una foto de la galería por ID.
   * @param photoId ID de la foto a eliminar.
   * @returns Observable que indica si la eliminación fue exitosa
   */
  deletePhoto(photoId: string): Observable<void> {
    const photoRef = doc(this.firestore, this.PHOTOS_COLLECTION, photoId);
    return from(deleteDoc(photoRef)).pipe(
      catchError(error => {
        console.error('Error al eliminar la foto:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Comparte una foto en la galería de un usuario enlazado.
   * @param senderId ID del usuario que comparte la foto
   * @param linkedUserId ID del usuario enlazado
   * @param imageDataUrl URL de la imagen a compartir
   * @param senderName Nombre del usuario que comparte la foto
   * @param description Descripción opcional para la foto
   * @returns Observable con la URL de la foto compartida
   */
  sharePhoto(senderId: string, linkedUserId: string, imageDataUrl: string, senderName: string, description?: string): Observable<string> {
    const photoId = this.generatePhotoId(senderId, linkedUserId); // Genera un ID único para la foto
    const photoRef = doc(this.firestore, this.PHOTOS_COLLECTION, photoId);

    const sharedPhoto: SharedPhoto = {
      id: photoId, // Asigna el ID generado a la propiedad 'id'
      senderId,
      linkedUserId,
      imageUrl: imageDataUrl,
      senderName,
      description: description || '',
      createdAt: Timestamp.now().toDate() // La fecha de creación
    };

    return from(setDoc(photoRef, sharedPhoto)).pipe(
      map(() => photoId), // Retorna el ID de la foto compartida
      catchError(error => {
        console.error('Error al compartir foto:', error);
        return throwError(() => new Error('No se pudo compartir la foto.'));
      })
    );
  }

  private generatePhotoId(senderId: string, linkedUserId: string): string {
    const [first, second] = [senderId, linkedUserId].sort();
    return `${first}_${second}_${new Date().getTime()}`;
  }
}
