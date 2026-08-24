import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';

export interface UserProfile {
    uid: string;
    displayName: string;
    phoneNumber?: string;
    photoURL: string;
    bio: string;
    followersCount: number;
    followingCount: number;
    likesCount: number;
    createdAt: string;
    loginMethod: string;
    profileViews?: string[];
}

export async function syncUserProfile(user: { uid: string; phoneNumber?: string | null; photoURL?: string | null; displayName?: string | null }, loginMethod: 'phone' | 'google') {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const newUser: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || `Usuario ${user.phoneNumber?.slice(-4) || user.uid.slice(0, 4)}`,
            phoneNumber: user.phoneNumber || '',
            photoURL: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`,
            bio: '¡Hola! Estoy usando Mikigram.',
            followersCount: 0,
            followingCount: 0,
            likesCount: 0,
            createdAt: new Date().toISOString(),
            loginMethod,
            profileViews: []
        };
        await setDoc(userRef, newUser);
        return newUser;
    }

    return userSnap.data() as UserProfile;
}

export async function recordProfileView(profileOwnerUid: string, viewerUid: string) {
    if (profileOwnerUid === viewerUid) return;
    const userRef = doc(db, 'users', profileOwnerUid);
    await updateDoc(userRef, {
        profileViews: arrayUnion(viewerUid)
    });
}