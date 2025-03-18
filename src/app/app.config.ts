import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp({
      apiKey: "AIzaSyCp1jtmO8SFvCfOmUwEJbNunktjqXoQmFs",
      authDomain: "soulpics-cec35.firebaseapp.com",
      projectId: "soulpics-cec35",
      storageBucket: "soulpics-cec35.firebasestorage.app",
      messagingSenderId: "572610984754",
      appId: "1:572610984754:web:7d01a07db5fcc1fca1352b",
      measurementId: "G-BPC4FE2XE6"
    })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideMessaging(() => getMessaging()),
    provideStorage(() => getStorage()),
    ReactiveFormsModule,
    FormsModule
  ]
};
