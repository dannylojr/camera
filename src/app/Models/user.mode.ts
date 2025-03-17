export interface User {
    uid: string;
    email: string | null;
    displayName?: string | undefined;
    photoURL?: string | undefined;
    linkedUserId?: string | undefined;
    linkedUserInfo?: any;
}
