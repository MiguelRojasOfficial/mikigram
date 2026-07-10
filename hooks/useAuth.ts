import { useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useChatStore } from '@/store/useChatStore';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const useAuth = () => {
  const { user, setUser } = useChatStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [setUser]);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedUser = result.user;


      if (loggedUser) {
        await setDoc(doc(db, "users", loggedUser.uid), {
          uid: loggedUser.uid,
          displayName: loggedUser.displayName,
          email: loggedUser.email,
          photoURL: loggedUser.photoURL,
          lastSeen: serverTimestamp()
        }, { merge: true });
      }

    } catch (error) {
      console.error("Error al iniciar sesión", error);
    }
  };

  const logout = () => signOut(auth);

  return { user, loginWithGoogle, logout };
};