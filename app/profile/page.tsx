'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProfileView from '@/components/ProfileView';
import { Loader2 } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [userPosts, setUserPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(collection(db, 'posts'), where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserPosts(posts);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
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
    profileViews: [],
    // Pasamos la lista de imágenes subidas para la cuadrícula del perfil
    posts: userPosts,
    postsCount: userPosts.length,
  };

  return <ProfileView user={userProfile} posts={userPosts} isOwnProfile={true} />;
}