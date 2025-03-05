import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'camera',
        loadComponent: () => import('./camera/camera.component').then(m => m.CameraComponent),
    },
    {
        path: 'galeria',
        loadComponent: () => import('./galeria/galeria.component').then(m => m.GaleriaComponent),
    },
    {
        path: '**',
        redirectTo: 'camera',
        pathMatch: 'full'
    }
];
