import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, getDocs, where, writeBatch } from 'firebase/firestore';

export const useChat = (chatId: string | null, userId: string | undefined) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setIsRecipientTyping(false);
     return;
    }

    setMessages([]);
    setIsRecipientTyping(false);

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const chatRef = doc(db, "chats", chatId);
    const unsubscribeChatMeta = onSnapshot(chatRef, (snapshot) => {
      if (snapshot.exists() && userId) {
        const data = snapshot.data();
        const typingState = data.typing || {};
        const partnerId = data.participants.find((id: string) => id !== userId);

        setIsRecipientTyping(!!typingState[partnerId]);
      }
    });

    return () => {
      unsubscribeMessages();
      unsubscribeChatMeta();
    };
  }, [chatId, userId]);

  useEffect(() => {
    if (!chatId || !userId) return;

    const markMessagesAsRead = async () => {
      try {
        const messagesRef = collection(db, "chats", chatId, "messages");
        const q = query(messagesRef, where("senderId", "!=", userId), where("read", "==", false));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) return;

        const batch = writeBatch(db);
        querySnapshot.forEach((msgDoc) => {
          batch.update(msgDoc.ref, { read: true });
        });
        await batch.commit();
      } catch (error) {
        console.error("Error al marcar como leido:", error);
      }
    };
    markMessagesAsRead();
  }, [chatId, userId]);

  const sendMessage = async (payload: { text?: string; fileURL?: string; type: 'text' | 'image' | 'file' }, senderId: string) => {
    if (!chatId) return;

    const messageData = {
      senderId,
      createdAt: serverTimestamp(),
      read: false,
      type: payload.type,
      text: payload.text || '',
      fileURL: payload.fileURL || null
    };

    await addDoc(collection(db, "chats", chatId, "messages"), { ...messageData });

    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      lastMessage: payload.type === 'image' ? 'Foto' : payload.type === 'file' ? 'Archivo' : payload.text,
      updateAt: serverTimestamp(),
      [`typing.${senderId}`]: false
    });
  };

  const uploadFileAndSendMessage = async (file: File, senderId: string) => {
    if (!chatId) return;

    const isImage = file.type.startsWith('image/');
    const type = isImage ? 'image' : 'file';

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      console.error("Faltan las credenciales de Cloudinary");
      return;
    }

    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', `chats/${chatId}`);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/upload`, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(Math.round(progress));
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const secureUrl = response.secure_url;

          setUploadProgress(null);

          await sendMessage({ type, fileURL: secureUrl, text: file.name }, senderId);
        } else {
          console.error("Error en la respuesta de Cloudinary:", xhr.responseText);
          setUploadProgress(null);
        }
      };

      xhr.onerror = () => {
        console.error("Error de conexión a Cloudinary");
        setUploadProgress(null);
      };

      xhr.send(formData);

    } catch (error) {
      console.error("Error crítico durante el upload:", error);
      setUploadProgress(null);
    }
  };

  const setMyTypingStatus = async (isTyping: boolean) => {
    if (!chatId || !userId) return;
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      [`typing.${userId}`]: isTyping
    });
  };

  const editMessage = async (messageId: string, newText: string) => {
    if (!chatId) return;
    try {
      const msgRef = doc(db, "chats", chatId, "messages", messageId);
      await updateDoc(msgRef, {
        text: newText,
        isEdited: true
      }); 
    } catch (error) {
      console.error("Error al editar el mensaje:", error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!chatId) return;
    try {
      const msgRef = doc(db, "chats", chatId, "messages", messageId);
      await updateDoc(msgRef, {
        text: "Este mensaje fue eliminado",
        type: "text",
        fileURL: null,
        isDeleted: true
      });

      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        lastMessage: "Mensaje eliminado",
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error al eliminar el mensaje:", error);
    }
  };

  return { messages, sendMessage, isRecipientTyping, setMyTypingStatus, uploadFileAndSendMessage, uploadProgress, editMessage, deleteMessage };
};