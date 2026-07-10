import {useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, collectionGroup, orderBy, limit, doc, getDoc, getDocs} from 'firebase/firestore';
import { useChatStore } from '@/store/useChatStore';
import toast from 'react-hot-toast';

export const useGlobalNotifications = () => {
    const { user, selectedChat, setSelectedChat } = useChatStore();
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (!user) return;

        const playNotificationSound = () => {
            const audio = new Audio('/son_duq.mp3');
            audio.volume = 0.5;
            audio.play().catch(err => console.log("Audio bloqueado por el navegador:", err));
        };

        const q = query(
            collectionGroup(db, "messages"),
            where("senderId", "!=", user.uid),
            orderBy("createdAt", "desc"),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            if (isFirstRender.current) {
                isFirstRender.current = false;
                return;
            }

            for ( const change of snapshot.docChanges()) {
                if (change.type === 'added') {
                    const newMsg = change.doc.data();
                    const pathSegments = change.doc.ref.path.split('/');
                    const msgChatId = pathSegments[1];

                    if (msgChatId !== selectedChat) {
                        playNotificationSound();
                        let senderName = "Usuario";
                        let senderPhoto = "";

                        try {
                            const userDocRef = doc(db, "users", newMsg.senderId);
                            const userDocSnap  = await getDoc(userDocRef);
                            if (userDocSnap.exists()) {
                                const userData = userDocSnap.data();
                                senderName = userData.displayName || "Usuario de Mikigram";
                                senderPhoto = userData.photoURL || "";
                            }
                        } catch (error) {
                            console.error("Error al traer datos del remitente para e Toast:", error);
                        }

                        const handleNotificationClick = async () => {
                            toast.dismiss(change.doc.id);

                            if (typeof setSelectedChat === 'function') {
                                setSelectedChat(msgChatId);
                            } else {
                                console.warm("La acción setSelectedChat no está disponible en tu store.");
                            }
                        };

                        toast.custom((t) => (
                            <div                               
                                className={`${
                                    t.visible ? 'animate-in fade-in slide-in-from-top-4' : 'animate-out fade-out'
                                } max-w-sm w-full bg-white dark:bg-[#202c35] shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-gray-100 dark:border-gray-700 p-4 cursor-pointer`}
                                onClick={handleNotificationClick}
                            >
                                {senderPhoto ? (
                                    <img
                                        src={senderPhoto}
                                        alt=""
                                        className="h-10 w-10 rounded-full object-cover border border-gray-200 dark.border-gfray-600 flex-shrink-0"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-inner flex-shrink-0">
                                        {senderName.charAt(0).toUpperCase()}
                                    </div>
                            )}
                                <div className="flex-1 w-0">
                                    <p className="text-xs font-bold text-blue-500 dark:text-blue-400">
                                        {senderName}
                                    </p>

                                    <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mt-0.5 truncate">
                                        {newMsg.type === 'image' ? (
                                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                                <span>Foto recibida</span>
                                                {newMsg.fileURL && (
                                                    <img
                                                        src={newMsg.fileURL}
                                                        alt="Miniatura"
                                                        className="h-6 w-6 rounded object-cover ml-auto border border-gray-300"
                                                    />
                                                )}
                                            </div>    
                                        ) :  newMsg.type === 'file' ? (
                                          <span className="text-blue-600 dark:text-blue-400">Archivo: {newMsg.text}</span>
                                        ) : (
                                          <p className="text-gray-600 dark:text-gray-300 truncate">{newMsg.text}</p>
                                        )}
                                    </div>
                                </div>           
                            </div>
                        ), { id: change.doc.id });
                    }
                }
            }
        });

        const callQuery = query(collectionGroup(db, "call"), where("offer.status", "==", "ringing"));
        const unsubscribeCalls = onSnapshot(callQuery, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added" || change.type === 'modified') {
                    const callData = change.doc.data();
                    
                    if (callData.offer && callData.offer.callerId !== user.uid && callData.status !=='accepted' && callData.status !== 'ended') {
                    }
                }
            });
        });

        return () => {
            unsubscribe();
            unsubscribeCalls();
        };
    }, [user, selectedChat, setSelectedChat]);
};