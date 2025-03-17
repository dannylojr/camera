export interface SharedPhoto {
    id: string;
    senderId: string;        // Propiedad para el ID del usuario que envía la foto
    linkedUserId: string;    // Propiedad para el ID del usuario enlazado
    imageUrl: string;        // URL de la imagen compartida
    senderName: string;      // Nombre del usuario que comparte la foto
    description?: string;    // Descripción opcional para la foto
    createdAt: Date;         // Fecha en la que se comparte la foto
    photoURL?: string;       // URL adicional para la foto (si es necesario)
    createdBy?: string;      // Nombre del creador de la foto (si es necesario)
    creatorName?: string;    // Nombre del creador de la foto (si es necesario)
    linkId?: string;         // Enlace único para identificar la foto compartida
}
