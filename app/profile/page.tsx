'use client'

import { useAuth } from '@/hooks/useAuth';
import ProfileView from '@/components/ProfileView';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
                Inicia sesión para ver tu perfil.
            </div>
        );
    }

    const userProfile = {
        uid: user.uid,
        displayName: user.displayName || `Usuario ${user.phoneNumber?.slice(-4) || 'Mikigram'}`,
        phoneNumber: user.phoneNumber || '',
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`,
        bio: '¡Hola! Estoy usando Mikigram.',
        followersCount: 0,
        followingCount: 0,
        likesCount: 0,
        createdAt: new Date().toISOString(),
        loginMethod: user.phoneNumber ? 'phone' : 'google',
        profileViews: []
    };

    return <ProfileView user={userProfile} isOwnProfile={true} />;
}