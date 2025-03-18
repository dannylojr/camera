import { Injectable, inject } from "@angular/core"
import { type Observable, from, of, throwError, BehaviorSubject, switchMap, map, catchError, tap } from "rxjs"
import type { Link } from "../Models/link.mode"
import { AuthService } from "./auth.service"
import type { User } from "../Models/user.mode"
import {
  type Firestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  type Timestamp,
  onSnapshot,
  getFirestore,
} from "firebase/firestore"
import { initializeApp } from "firebase/app"
import { firebaseConfig } from "../../environments/firebase-config"
import { LinkedRequests } from "../Models/link-requests"

@Injectable({
  providedIn: "root",
})
export class LinkPeopleService {
  private firestore: Firestore
  private authService = inject(AuthService)

  // BehaviorSubjects para mantener el estado
  private receivedRequestsSubject = new BehaviorSubject<Link[]>([])
  private sentRequestsSubject = new BehaviorSubject<Link[]>([])
  private linkedUsersSubject = new BehaviorSubject<User[]>([])

  // Observables públicos
  public receivedRequests$ = this.receivedRequestsSubject.asObservable()
  public sentRequests$ = this.sentRequestsSubject.asObservable()
  public linkedUsers$ = this.linkedUsersSubject.asObservable()

  constructor() {
    const app = initializeApp(firebaseConfig)
    this.firestore = getFirestore(app)

    // Inicializar los listeners cuando el usuario está autenticado
    this.authService.user$
      .pipe(
        switchMap((user) => {
          if (user) {
            this.initRequestListeners(user.uid)
            return this.loadLinkedUsers()
          }
          return of(null)
        }),
      )
      .subscribe()
  }

  /**
   * Inicializa los listeners para las solicitudes recibidas y enviadas
   */
  private initRequestListeners(userId: string): void {
    // Listener para solicitudes recibidas
    const receivedRef = collection(this.firestore, "linkRequests")
    const receivedQuery = query(receivedRef, where("recipientId", "==", userId))

    onSnapshot(receivedQuery, (snapshot) => {
      const requests: Link[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          senderId: data["senderId"],
          recipientId: data["recipientId"],
          status: data["status"] as "pending" | "accepted" | "rejected",
          createdAt: (data["createdAt"] as Timestamp).toDate(),
        }
      })
      this.receivedRequestsSubject.next(requests)
    })

    // Listener para solicitudes enviadas
    const sentRef = collection(this.firestore, "linkRequests")
    const sentQuery = query(sentRef, where("senderId", "==", userId))

    onSnapshot(sentQuery, (snapshot) => {
      const requests: Link[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          senderId: data["senderId"],
          recipientId: data["recipientId"],
          status: data["status"] as "pending" | "accepted" | "rejected",
          createdAt: (data["createdAt"] as Timestamp).toDate(),
        }
      })
      this.sentRequestsSubject.next(requests)
    })
  }

  /**
   * Busca un usuario por su correo electrónico
   */
  getUserIdByEmail(email: string): Observable<string | null> {
    const usersRef = collection(this.firestore, "users")
    const q = query(usersRef, where("email", "==", email))

    return from(getDocs(q)).pipe(
      map((snapshot) => {
        if (snapshot.empty) return null
        return snapshot.docs[0].id
      }),
      catchError((error) => {
        console.error("Error al buscar usuario por email:", error)
        return throwError(() => new Error("No se pudo encontrar el usuario con ese correo electrónico"))
      }),
    )
  }

  /**
   * Envía una solicitud de enlace a otro usuario
   */
  sendLinkRequest(recipientId: string): Observable<string> {
    return this.authService.user$.pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error("No hay usuario autenticado"))
        }

        // Verificar si ya existe una solicitud pendiente
        return this.checkExistingRequest(user.uid, recipientId).pipe(
          switchMap((exists) => {
            if (exists) {
              return throwError(() => new Error("Ya existe una solicitud pendiente con este usuario"))
            }

            // Crear la nueva solicitud
            const linkRequest: LinkedRequests = {
              senderId: user.uid,
              recipientId: recipientId,
              status: "pending",
              createdAt: new Date(),
            }

            return from(addDoc(collection(this.firestore, "linkRequests"), linkRequest)).pipe(
              map((docRef) => docRef.id),
            )
          }),
        )
      }),
      catchError((error) => {
        console.error("Error al enviar solicitud de enlace:", error)
        return throwError(() => error)
      }),
    )
  }

  /**
   * Verifica si ya existe una solicitud entre dos usuarios
   */
  private checkExistingRequest(senderId: string, recipientId: string): Observable<boolean> {
    const requestsRef = collection(this.firestore, "linkRequests")
    const q1 = query(
      requestsRef,
      where("senderId", "==", senderId),
      where("recipientId", "==", recipientId),
      where("status", "==", "pending"),
    )

    const q2 = query(
      requestsRef,
      where("senderId", "==", recipientId),
      where("recipientId", "==", senderId),
      where("status", "==", "pending"),
    )

    return from(Promise.all([getDocs(q1), getDocs(q2)])).pipe(
      map(([snapshot1, snapshot2]) => {
        return !snapshot1.empty || !snapshot2.empty
      }),
    )
  }

  /**
   * Obtiene las solicitudes recibidas por el usuario actual
   */
  getReceivedRequests(): Observable<Link[]> {
    return this.receivedRequests$
  }

  /**
   * Obtiene las solicitudes enviadas por el usuario actual
   */
  getSentRequests(): Observable<Link[]> {
    return this.sentRequests$
  }

  /**
   * Acepta una solicitud de enlace
   */
  acceptRequest(requestId: string, senderId: string): Observable<void> {
    return this.authService.user$.pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error("No hay usuario autenticado"))
        }

        // Actualizar el estado de la solicitud
        const requestRef = doc(this.firestore, "linkRequests", requestId)

        // Crear un enlace en la colección de enlaces
        const link: Link = {
          id: requestId,
          senderId: senderId,
          recipientId: user.uid,
          status: "accepted",
          createdAt: new Date(),
        }

        return from(
          Promise.all([
            updateDoc(requestRef, { status: "accepted", updatedAt: serverTimestamp() }),
            addDoc(collection(this.firestore, "linkedUsers"), link),
          ]),
        ).pipe(map(() => void 0))
      }),
      catchError((error) => {
        console.error("Error al aceptar solicitud:", error)
        return throwError(() => error)
      }),
    )
  }

  /**
   * Rechaza una solicitud de enlace
   */
  rejectRequest(requestId: string): Observable<void> {
    const requestRef = doc(this.firestore, "linkRequests", requestId)
    return from(
      updateDoc(requestRef, {
        status: "rejected",
        updatedAt: serverTimestamp(),
      }),
    ).pipe(
      map(() => void 0),
      catchError((error) => {
        console.error("Error al rechazar solicitud:", error)
        return throwError(() => error)
      }),
    )
  }

  /**
   * Cancela una solicitud de enlace enviada
   */
  cancelRequest(requestId: string): Observable<void> {
    const requestRef = doc(this.firestore, "linkRequests", requestId)
    return from(deleteDoc(requestRef)).pipe(
      map(() => void 0),
      catchError((error) => {
        console.error("Error al cancelar solicitud:", error)
        return throwError(() => error)
      }),
    )
  }

  /**
   * Reenvía una solicitud de enlace (actualiza la fecha)
   */
  resendRequest(requestId: string): Observable<void> {
    const requestRef = doc(this.firestore, "linkRequests", requestId)
    return from(
      updateDoc(requestRef, {
        createdAt: serverTimestamp(),
        status: "pending",
      }),
    ).pipe(
      map(() => void 0),
      catchError((error) => {
        console.error("Error al reenviar solicitud:", error)
        return throwError(() => error)
      }),
    )
  }

  /**
   * Carga los usuarios enlazados con el usuario actual
   */
  loadLinkedUsers(): Observable<User[]> {
    return this.authService.user$.pipe(
      switchMap((user) => {
        if (!user) {
          return of([])
        }

        const linkedUsersRef = collection(this.firestore, "linkedUsers")
        const q1 = query(linkedUsersRef, where("senderId", "==", user.uid), where("status", "==", "accepted"))
        const q2 = query(linkedUsersRef, where("recipientId", "==", user.uid), where("status", "==", "accepted"))

        return from(Promise.all([getDocs(q1), getDocs(q2)])).pipe(
          switchMap(([snapshot1, snapshot2]) => {
            const linkedUserIds: string[] = []

            // Extraer IDs de usuarios enlazados
            snapshot1.docs.forEach((doc) => {
              const data = doc.data()
              linkedUserIds.push(data["recipientId"])
            })

            snapshot2.docs.forEach((doc) => {
              const data = doc.data()
              linkedUserIds.push(data["senderId"])
            })

            if (linkedUserIds.length === 0) {
              return of([])
            }

            // Obtener información de los usuarios enlazados
            const userPromises = linkedUserIds.map((id) =>
              getDoc(doc(this.firestore, "users", id)).then((userDoc) => {
                if (userDoc.exists()) {
                  const userData = userDoc.data()
                  return {
                    uid: userDoc.id,
                    email: userData["email"],
                    displayName: userData["displayName"],
                    photoURL: userData["photoURL"],
                  } as User
                }
                return null
              }),
            )

            return from(Promise.all(userPromises)).pipe(map((users) => users.filter((user) => user !== null) as User[]))
          }),
        )
      }),
      catchError((error) => {
        console.error("Error al cargar usuarios enlazados:", error)
        return of([])
      }),
      tap((users) => {
        this.linkedUsersSubject.next(users)
      }),
    )
  }

  /**
   * Desenlaza a un usuario
   */
  unlinkUser(linkedUserId: string): Observable<void> {
    return this.authService.user$.pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(() => new Error("No hay usuario autenticado"))
        }

        const linkedUsersRef = collection(this.firestore, "linkedUsers")
        const q1 = query(
          linkedUsersRef,
          where("senderId", "==", user.uid),
          where("recipientId", "==", linkedUserId),
          where("status", "==", "accepted"),
        )

        const q2 = query(
          linkedUsersRef,
          where("senderId", "==", linkedUserId),
          where("recipientId", "==", user.uid),
          where("status", "==", "accepted"),
        )

        return from(Promise.all([getDocs(q1), getDocs(q2)])).pipe(
          switchMap(([snapshot1, snapshot2]) => {
            const deletePromises: Promise<void>[] = []

            snapshot1.docs.forEach((doc) => {
              deletePromises.push(deleteDoc(doc.ref))
            })

            snapshot2.docs.forEach((doc) => {
              deletePromises.push(deleteDoc(doc.ref))
            })

            if (deletePromises.length === 0) {
              return throwError(() => new Error("No se encontró el enlace con este usuario"))
            }

            return from(Promise.all(deletePromises)).pipe(map(() => void 0))
          }),
        )
      }),
      catchError((error) => {
        console.error("Error al desenlazar usuario:", error)
        return throwError(() => error)
      }),
    )
  }

  /**
   * Obtiene información de un usuario por su ID
   */
  getUserInfo(userId: string): Observable<User | null> {
    return from(getDoc(doc(this.firestore, "users", userId))).pipe(
      map((userDoc) => {
        if (userDoc.exists()) {
          const userData = userDoc.data()
          return {
            uid: userDoc.id,
            email: userData["email"],
            displayName: userData["displayName"],
            photoURL: userData["photoURL"],
          } as User
        }
        return null
      }),
      catchError((error) => {
        console.error("Error al obtener información del usuario:", error)
        return of(null)
      }),
    )
  }
}