export interface Link {
    id: string;
    senderId: string;
    recipientId: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: any;
}
