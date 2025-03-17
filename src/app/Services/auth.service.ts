import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updatePassword, User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { Firestore, doc, setDoc, serverTimestamp, getFirestore, getDoc } from 'firebase/firestore';
import { firebaseConfig } from '../../environments/firebase-config';
import { User } from '../Models/user.mode';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public auth;
  private firestore;
  private userSubject: BehaviorSubject<FirebaseUser | null> = new BehaviorSubject<FirebaseUser | null>(null);
  public user$: Observable<FirebaseUser | null> = this.userSubject.asObservable(); // This is the missing property

  constructor() {
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
    this.firestore = getFirestore(app);
    console.log('Firebase App Initialized:', app);

    // Mantener la sesión iniciada
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user); // Update the observable

      if (user) {
        // Guardar el usuario en el localStorage si está autenticado
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        // Eliminar el usuario del localStorage si no está autenticado
        localStorage.removeItem('user');
      }
    });

    // Rehidratar la sesión al iniciar la aplicación
    const rehydratedUser = this.rehydrateSession();
    if (rehydratedUser) {
      this.userSubject.next(rehydratedUser);
    }
  }

  // Método para rehidratar la sesión
  public rehydrateSession(): FirebaseUser | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null; // Retornar el usuario rehidratado o null
  }

  // Crear una cuenta con email y contraseña
  async createAccount(email: string, password: string, displayName?: string, photoURL?: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName || '',
        photoURL: photoURL || '',
      };
      await setDoc(doc(this.firestore, 'users', user.uid), {
        ...user,
        createdAt: serverTimestamp()
      });
      console.log('Cuenta creada con éxito:', userCredential.user);
    } catch (error) {
      console.error('Error al crear la cuenta:', error);
      throw error; // Propagar el error para su manejo en el componente
    }
  }

  // Iniciar sesión con email y contraseña
  async signIn(email: string, password: string): Promise<FirebaseUser | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Inicio de sesión exitoso:', userCredential.user);
      return userCredential.user; // Retornar el usuario autenticado
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error; // Propagar el error para su manejo en el componente
    }
  }

  // Iniciar sesión con Google
  async signInWithGoogle(): Promise<FirebaseUser | null> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);
      const user: User = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || '',
        photoURL: userCredential.user.photoURL || '',
      };
      await setDoc(doc(this.firestore, 'users', user.uid), {
        ...user,
        createdAt: serverTimestamp()
      }, { merge: true });
      console.log('Inicio de sesión con Google exitoso:', userCredential.user);
      return userCredential.user; // Retornar el usuario autenticado
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error; // Propagar el error para su manejo en el componente
    }
  }

  // Cambiar la contraseña
  async changePassword(newPassword: string): Promise<void> {
    const user = this.auth.currentUser; // Obtener usuario autenticado
    if (user) {
      try {
        await updatePassword(user, newPassword); // Usar el método correctamente
        console.log('Contraseña cambiada con éxito');
      } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        throw error; // Propagar el error para su manejo en el componente
      }
    } else {
      console.error('No hay usuario autenticado');
      throw new Error('No hay usuario autenticado');
    }
  }

  // Cerrar sesión
  async signOut(): Promise<void> {
    try {
      await this.auth.signOut();
      localStorage.removeItem('user'); // Eliminar el usuario del localStorage al cerrar sesión
      console.log('Sesión cerrada con éxito');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error; // Propagar el error para su manejo en el componente
    }
  }

  // Obtener información del usuario autenticado
  async getCurrentUser(): Promise<User | null> {
    const user = this.auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        // Cargar información del usuario enlazado
        if (userData.linkedUserId) {
          const linkedUserDoc = await getDoc(doc(this.firestore, 'users', userData.linkedUserId));
          if (linkedUserDoc.exists()) {
            userData.linkedUserInfo = linkedUserDoc.data(); // Agregar información del usuario enlazado
          }
        }
        return userData; // Retornar el usuario con la información adicional
      }
    }
    return null; // Retornar null si no hay usuario autenticado
  }
}