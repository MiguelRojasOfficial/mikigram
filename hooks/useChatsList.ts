import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { useChatStore } from '@/store/useChatStore';

export const useChatsList = () => {
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useChatStore(); 

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "chats"),
            where("participants", "array-contains", user.uid),
            orderBy("updatedAt", "desc")
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const chatsData = await Promise.all(
                snapshot.docs.map(async (chatDoc) => {
                    const data = chatDoc.data();

                    const targetUid = data.participants.find((id: string) => id !== user.uid);

                    let targetUserData = {};
                    if (targetUid) {
                        const userDoc = await getDoc(doc(db, "users", targetUid));
                        if (userDoc.exists()) {
                            targetUserData = userDoc.data();
                        }
                    }

                    return {
                        id: chatDoc.id,
                        ...data,
                        recipient: targetUserData
                    };
                })
            );

            setChats(chatsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return { chats, loading };
}