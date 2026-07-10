import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useChatStore } from '@/store/useChatStore';

export const useNavigation = () => {
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { user, setSelectedChat } = useChatStore();

    const searchUser = async (email: string) => {
        if (!email.trim() || email === user?.email) {
            setSearchResults([]);
            return;
        }
        setLoading(true);
        try {
            const q = query(collection(db, "users"), where("email","==", email.trim()));
            const querySnapshot = await getDocs(q);
            const users: any[] = [];
            querySnapshot.forEach((doc) => {
                users.push(doc.data());
            });
            setSearchResults(users);
        } catch (error) {
            console.error("Error buscando usuario:", error);
        } finally {
            setLoading(false);
        }
    };

    const createChat = async (targetUser: any) => {
        if (!user) return;

        try {
            const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid)
            );

            const querySnapshot = await getDocs(q);
            let existingChatId = null;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.participants.includes(targetUser.uid) && data.type === "direct") {
                    existingChatId = doc.id;
                }
            });

            if (existingChatId) {
                setSelectedChat(existingChatId)
                setSearchResults([]);
                return;
            }

            const newChatRef = await addDoc(collection(db, "chats"), {
                participants: [user.uid, targetUser.uid],
                type: "direct",
                createdAt: serverTimestamp(),
                lastMessage: "",
                updatedAt: serverTimestamp()
            });

            setSelectedChat(newChatRef.id);
            setSearchResults([]);
        } catch (error) {
            console.error("Error al crear el chat:", error);
        }
    };
    return { searchUser, createChat, searchResults, loading };
};