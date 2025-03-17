import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LinkedRequests } from '../Models/link-requests';
import { Link } from '../Models/link.mode';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../environments/firebase-config';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })

export class LinkPeopleService {
  private auth;
  private firestore;

  constructor() {
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
    this.firestore = getFirestore(app);
    console.log('Firebase App Initialized:', app);
  }

  private getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        resolve(user);
      });
    });
  }

  async sendLinkRequest(receiverEmail: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('No authenticated user');

    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('email', '==', receiverEmail));
    const snapshot = await getDocs(q);

    if (snapshot.empty) throw new Error('User not found');

    const receiverId = snapshot.docs[0].id;
    await addDoc(collection(this.firestore, 'linkRequests'), {
      senderId: user.uid,
      recipientId: receiverId,
      status: 'pending',
      createdAt: new Date()
    });
  }

  getReceivedRequests(): Observable<Link[]> {
    return new Observable(observer => {
      onAuthStateChanged(this.auth, async (user) => {
        if (!user) {
          observer.next([]);
          return;
        }

        const linkRequestsRef = collection(this.firestore, 'linkRequests');
        const q = query(linkRequestsRef, where('recipientId', '==', user.uid), where('status', '==', 'pending'));
        const snapshot = await getDocs(q);

        const requests: Link[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Link));
        observer.next(requests);
      });
    });
  }

  async acceptRequest(requestId: string, senderId: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('No authenticated user');

    await addDoc(collection(this.firestore, 'linkedUsers'), {
      senderId: user.uid,
      recipientId: senderId,
      status: 'accepted',
      createdAt: new Date()
    });

    await updateDoc(doc(this.firestore, 'linkRequests', requestId), { status: 'accepted' });
  }

  async rejectRequest(requestId: string): Promise<void> {
    await updateDoc(doc(this.firestore, 'linkRequests', requestId), { status: 'rejected' });
  }

  getLinkedUser(): Observable<string | null> {
    return new Observable(observer => {
      onAuthStateChanged(this.auth, async (user) => {
        if (!user) {
          observer.next(null);
          return;
        }

        const linkedUsersRef = collection(this.firestore, 'linkedUsers');
        const q = query(linkedUsersRef, where('senderId', '==', user.uid));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const linkedData = snapshot.docs[0].data() as LinkedRequests;
          observer.next(linkedData.recipientId);
        } else {
          observer.next(null);
        }
      });
    });
  }

  async unlinkUser(linkId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'linkedUsers', linkId));
  }
}