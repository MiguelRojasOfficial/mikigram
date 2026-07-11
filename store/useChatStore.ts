import { create } from "zustand";

interface ChatState {
    user: any | null;
    selectedChat: string | null;
    activeRecipient: {
        displayName: string;
        photoURL: string;
        email: string;
    } | null;
    setUser: (user: any) => void;
    setSelectedChat: (chatId: string | null, recipientData?: any) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    user: null,
    selectedChat: null,
    activeRecipient: null,
    setUser: (user) => set({ user }),
    setSelectedChat: (chatId, recipientData = null) => set({ selectedChat: chatId, activeRecipient: recipientData }),
}));

 
   