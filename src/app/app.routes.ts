import { Routes } from '@angular/router';
import { NoAuthGuard } from './Guards/no-auth-guard.service';
import { AuthGuard } from './Guards/auth-guard.service';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./Sesion/login/login.component').then(m => m.LoginComponent),
        canActivate: [NoAuthGuard] // Usar NoAuthGuard para proteger la ruta de login
    },
    {
        path: 'register',
        loadComponent: () => import('./Sesion/register/register.component').then(m => m.RegisterComponent),
        canActivate: [NoAuthGuard] // Usar NoAuthGuard para proteger la ruta de registro
    },
    {
        path: 'forgot-password',
        loadComponent: () => import('./Sesion/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        canActivate: [NoAuthGuard] // Usar NoAuthGuard para proteger la ruta de recuperación de contraseña
    },
    {
        path: 'link-people',
        loadComponent: () => import('./Link/link-people/link-people.component').then(m => m.LinkPeopleComponent),
        canActivate: [AuthGuard] // Usar AuthGuard para proteger la ruta de enlace
    },
    {
        path: 'link-requests',
        loadComponent: () => import('./Link/link-requests/link-requests.component').then(m => m.LinkRequestsComponent),
        canActivate: [AuthGuard] // Usar AuthGuard para proteger la ruta de solicitudes de enlace
    },
    {
        path: 'linked-users',
        loadComponent: () => import('./Link/linked-users/linked-users.component').then(m => m.LinkedUsersComponent),
        canActivate: [AuthGuard] // Usar AuthGuard para proteger la ruta de solicitudes de enlace
    },
    {
        path: 'camera/:id',
        loadComponent: () => import('./camera/camera.component').then(m => m.CameraComponent),
        canActivate: [AuthGuard] // Usar AuthGuard para proteger la ruta de la cámara
    },
    {
        path: 'galeria/:id',
        loadComponent: () => import('./galeria/galeria.component').then(m => m.GaleriaComponent),
        canActivate: [AuthGuard] // Usar AuthGuard para proteger la ruta de la galería
    },
    {
        path: '**',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];