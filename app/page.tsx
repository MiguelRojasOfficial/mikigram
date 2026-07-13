'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigation } from '@/hooks/useNavigation';
import { useChatsList } from '@/hooks/useChatsList'
import { useChatStore } from '@/store/useChatStore';
import Login from '@/components/Login';
import ChatWindow from '@/components/ChatWindow';
import { Search, LogOut, MoreVertical, MessageCircle, Loader2, X } from "lucide-react";
import { useGlobalNotifications } from '@/hooks/useGlobalNotifications';

export default function Home() {
  const { user, logout } = useAuth();
  const [searchEmail, setSearchEmail] = useState('');
  const { searchUser, createChat, searchResults, loading: searchLoading } = useNavigation();
  const { chats, loading: chatsLoading } = useChatsList();
  const { selectedChat, setSelectedChat } = useChatStore(); 

  useGlobalNotifications();

  if (!user) return <Login />;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (searchEmail.trim() !== '') {
    searchUser(searchEmail.trim());
    }
  };

  const handleClearSearch = () => {
    setSearchEmail('');
    searchUser('');
  };

  return (
    <main className="flex h-screen w-full bg-[#f0f2f5] dark:bg-[#111b20] overflow-hidden">
      <aside 
        className={`${
          selectedChat ? 'hidden md:flex' : 'flex'
        } w-full md:max-w-[400px] border-r border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111b20] flex-col flex-shrink-0 h-full`}>
          <header className="h-[60px] p-4 flex justify-between items-center bg-[#f0f2f5] dark:bg-[#202c35]">
            <div className="flex items-center gap-3">
              <img 
                src={user.photoURL || ""} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border "
              />
              <span className="text-xs font-bold dark:text-white">
                {user.displayName?.split(' ')[0]}
              </span>
            </div>
            <div className="flex gap-4 text-gray-500">
              <button onClick={logout} title="Cerrar sesión">
                <LogOut size={20} className="hover:text-red-500 transition-colors" />
              </button>
              <MoreVertical size={20} />
            </div>
          </header>

        <form onSubmit={handleSearchSubmit} className="p-2 px-4">
          <div className="bg-gray-100 dark:bg-[#202c35] flex items-center px-3 py-1.5 rounded-lg">
            <Search size={20} className="text-gray-500 flex-shrink-0" />
            <input
              value={searchEmail}
              onChange={(e) => {
                setSearchEmail(e.target.value);
                if (e.target.value === '') {
                  searchUser('');
                } 
              }}
              placeholder="Buscar usuario por correo exacto ...."
              className="bg-transparent border-none outline-none px-3 w-full text-sm text-gray-800 dark:text-white"
            />
            <div className="flex items-center gap-1.5 min-w-[20px] justify-end">
              {searchLoading && <Loader2 size={16} className="animate-spin text-gray-500" />}
              {searchEmail && !searchLoading && (
                <button 
                  type="button" 
                  onClick={handleClearSearch} 
                  className="text-gray-400 hover:text-gray-200">
                    <X size={16} />
                  </button>
              )}
            </div>
          </div>
        </form>

        <div className="flex-1 overflow-y-auto border-t border-gray-100 dark:border-gray-800">
          {searchEmail.trim() !== '' ? (
            <div className="bg-blue-50/50 dark:bg-blue-950/5 p-2 animate-in fade-in duration-200">
              <div className="flex justify-between items-center px-2 mb-2">
                <p className="text-xs font-semibold text-blue-500">Resultados encontrados:</p>
                <button type="button" onClick={handleClearSearch} className="text-[11px] text-gray-400 hover:underline">Volver</button>
              </div>
              {searchResults && searchResults.length > 0 ? (
                searchResults.map((targetUser) => (
                  <div
                    key={targetUser.uid}
                    onClick={() => { createChat(targetUser); handleClearSearch(); }}
                    className="flex p-3 items-center gap-3 bg-white dark:bg-[#111b20] rounded-xl hover:bg-gray-100 dark:hover:bg-[#2a3942] cursor-pointer shadow-sm mb-1 border border-gray-100 dark:border-gray-800"     
                  >
                    <img src={targetUser.photoURL} alt="" className="h-10 w-10 rounded-full" />
                    <div className="overflow-hidden flex-1">
                      <h4 className="text-sm font-medium dark:text-white truncate">{targetUser.displayName}</h4>
                      <p className="text-xs text-gray-500 truncate">{targetUser.email}</p>
                    </div>
                  </div>
                ))
                ) : (
                  !searchLoading && <p className="text-xs text-gray-400 text-center py-4">No se encontraron usuarios.</p>
                )}
              </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {chatsLoading ? (
                <div className="flex justify-center items-center py-10 text-gray-400 gap-2 text-sm">
                  <Loader2 size={20} className="animate-spin" /> Cargando conversaciones.....
                </div>
              ) : chats.length > 0 ? (
                chats.map((chat) => {
                  const isSelected = selectedChat === chat.id;
                  return (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat.id, chat.recipient)}
                      className={`flex p-3 items-center gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-gray-100 dark:bg-[#2a3942]'
                          : 'hover:bg-gray-50 dark:hover:bg-[#202c35]/50'
                      }`}
                    >
                      <img
                        src={chat.recipient?.photoURL || "/default.png"}
                        alt=""
                        className="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                            {chat.recipient?.displayName || "Usuario de Mikigram"}    
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 with-emoji-support">
                          {chat.lastMessage || "Haga clic aquí para enviar su primer mensaje"}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400 mt-10">
                  <MessageCircle size={40} className="mb-3 opacity-20" />
                  <p className="text-xs italic font-light max-w-[200px]">
                    La bandeja de entrada esta vacía. Escribe un correo electrónico arriba para empezar.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
      <div className={`${selectedChat ? 'flex' : 'hidden md:flex'} flex-1 h-full min-w-0`}>
        <ChatWindow />
      </div>
      
    </main>
  );
}