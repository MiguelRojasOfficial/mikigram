import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useChatStore } from '@/store/useChatStore';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

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
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedUser = result.user;

      if (loggedUser) {
        // Intentar obtener coordenadas GPS reales del navegador
        let lat = -12.0463;
        let lng = -77.0427;

        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              await setDoc(doc(db, "users", loggedUser.uid), {
                uid: loggedUser.uid,
                displayName: loggedUser.displayName,
                email: loggedUser.email,
                photoURL: loggedUser.photoURL,
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                lastSeen: serverTimestamp()
              }, { merge: true });
            },
            async () => {
              // Si el usuario deniega el permiso GPS, guarda los datos básicos
              await setDoc(doc(db, "users", loggedUser.uid), {
                uid: loggedUser.uid,
                displayName: loggedUser.displayName,
                email: loggedUser.email,
                photoURL: loggedUser.photoURL,
                lastSeen: serverTimestamp()
              }, { merge: true });
            }
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