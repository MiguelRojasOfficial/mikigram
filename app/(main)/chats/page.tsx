'use client'

import { Search, MessageSquarePlus } from 'lucide-react';

export default function ChatsPage() {
    return (
        <div className="h-full w-full flex bg-white dark:bg-[#111b20]">
            <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <h1 className="text-xl font-bold dark:text-white">Chats</h1>
                    <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-500">
                        <MessageSquarePlus size={20} />
                    </button>
                </div>

                <div className="p-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar conversación..." 
                            className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-[#1f2c34] rounded-xl text-sm outline-none text-gray-800 dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 text-center text-gray-400 text-sm">
                    No tienes conversaciones activas.
                </div>
            </div>

            <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50 dark:bg-[#0c1317] text-gray-400 text-sm">
                Selecciona un chat para comenzar a enviar mensajes cifrados.
            </div>
        </div>
    );
}