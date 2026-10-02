import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useChatStore } from '@/store/useChatStore';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

export const useAuth = () => {
  const { user, setUser } = useChatStore();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser]);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      const loggedUser = result.user;

      if (loggedUser) {
        const userRef = doc(db, "users", loggedUser.uid);
        await setDoc(userRef, {
          uid: loggedUser.uid,
          displayName: loggedUser.displayName,
          email: loggedUser.email,
          photoURL: loggedUser.photoURL,
          lastSeen: serverTimestamp()
        }, { merge: true });

        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              await updateDoc(userRef, {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              });
            },
            (error) => {
              console.warn("Permiso de ubicación denegado o no disponible en celular:", error.message);
            },
            { enableHighAccuracy: false, timeout: 5000 }
          );
        }
      }
    } catch (error) {
      console.error("Error al iniciar sesión", error);
    }
  };

  const logout = () => signOut(auth);

  return { user, loading, loginWithGoogle, logout };
};