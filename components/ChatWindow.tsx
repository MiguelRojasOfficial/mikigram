'use client';

import { useState, useRef, useEffect, use } from 'react';
import { useChat } from '@/hooks/useChat';
import { useChatStore } from '@/store/useChatStore';
import { db } from '@/lib/firebase'
import { Smile, Paperclip, Send, Shield, Phone, Video, FileText, Loader2, Pencil, Trash2, X, Camera, ArrowLeft } from 'lucide-react';
import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import VideoCallModal from './VideoCallModal';

export default function ChatWindow() {
  const { selectedChat, user, activeRecipient } = useChatStore();
  const { 
    messages, 
    sendMessage, 
    isRecipientTyping, 
    setMyTypingStatus, 
    uploadFileAndSendMessage, 
    uploadProgress, 
    editMessage, 
    deleteMessage 
  } = useChat(selectedChat, user?.uid);

  const [text, setText] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageId: string; currentText: string } | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ id: string; text: string } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setIsIncomingCall(false);
    setShowVideoCall(false);
    if (!selectedChat || !user?.uid) return;

    const docRef = doc(db, "chats", selectedChat, "call", "current");
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (!snap.exists()) return;

      const data = snap.data();
      if (
        data?.offer &&
        data.offer.callerId !== user?.uid &&
        data.offer.status === 'ringing' &&
        data.status !== 'ended' &&
        data.status !== 'accepted'
      ) {
        setIsIncomingCall(true);
        setShowVideoCall(true);
      }
    }, (err) => {
      console.error("Error en listener de llamada:", err);
    });
    return () => unsubscribe();
  }, [selectedChat, user?.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    setText('');
    setEditingMessage(null);
    setShowEmojiPicker(false);
  }, [selectedChat]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (!selectedChat || !user) return;
    setMyTypingStatus(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setMyTypingStatus(false);
    }, 2000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    await uploadFileAndSendMessage(file, user.uid);
  };

  const handleContextMenu = (e: React.MouseEvent, msg: any) => {
    if (msg.senderId !== user?.uid || msg.isDeleted) return;
    e.preventDefault();

    const clientX = 'clientX' in e ? e.clientX : (e as any).touches[0].clientX;
    const clientY = 'clientY' in e ? e.clientY : (e as any).touches[0].clientY;

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      messageId: msg.id,
      currentText: msg.text
    });
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setText((prevText) => prevText + emojiData.emoji);
  };

  const startCamera = async () => {
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      alert("No se logra acceder a la cámara. Asegúrate de dar los permisos necesarios.");
      setShowCameraModal(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
      setShowCameraModal(false);
    };

    const capturePhoto = async () => {
      if (!videoRef.current || !user) return;
      const videoElement = videoRef.current;

      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      const context = canvas.getContext('2d');
      if (!context) return;

      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height );
      canvas.toBlob(async (blob) => {
        if (blob) {
          const photoFile = new File([blob], `camara_${Date.now()}.jpg`, { type: 'image/jpeg' });
          stopCamera();
          await uploadFileAndSendMessage(photoFile, user.uid);
        }
      }, 'image/jpeg', 0.9);
    };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (editingMessage) {
      await editMessage(editingMessage.id, text);
      setEditingMessage(null);
    } else {
      await sendMessage({ type: 'text', text }, user.uid);
    }
    setText('');
    setShowEmojiPicker(false);
  };

  const startEditMode = () => {
    if (!contextMenu) return;
    setEditingMessage({ id: contextMenu.messageId, text: contextMenu.currentText });
    setText(contextMenu.currentText);
    setContextMenu(null);
  };

  const cancelEditMode = () => {
    setEditingMessage(null);
    setText('');
  };

  if (!selectedChat) {
    return (
      <section className="flex-1 bg-[#efeae2] dark:bg-[#0b141a] flex items-center justify-center">
        <div className="text-center p-10 bg-white/50 dark:bg-[#202e35]/50 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl max-w-sm">
          <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Mikigram web</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Envía y recibe mensajes sin necesidad de mantener tu teléfono conectado.
          </p>
        </div>
      </section>
    );
  }

  const fallbackLetter = activeRecipient?.displayName?.charAt(0).toUpperCase() || "?";

  return (
    <section className="flex-1 flex flex-col bg-[#efeae2] dark:bg-[#0b141a] h-full relative">
      <header className="h-[60px] p-4 bg-[#f0f2f5] dark:bg-[#202c35] flex items-center justify-between border-l border-gray-300 dark:border-gray-700 shadow-sm z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setSelectedChat(null)}
            className="md:hidden p-1 mr-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          {activeRecipient?.photoURL ? (
            <img src={activeRecipient.photoURL} alt="" className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
              {fallbackLetter}
            </div>
          )}

          <div className="min-w-0">
            <h2 className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{activeRecipient?.displayName}</h2>
            {isRecipientTyping ? (
              <p className="text-[11px] text-blue-500 font-medium animate-pulse tracking-wide">escribiendo.....</p>
            ) : (
              <p className="text-[11px] text-gray-400 truncate">{activeRecipient?.email}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-5 text-gray-500 dark:text-gray-400">
          <Video
            onClick={() => {
              setIsIncomingCall(false);
              setShowVideoCall(true);
            }}
            size={20} 
            className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors" />
          <Phone size={16} className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors" />
        </div>
      </header>

      <div
        className="flex-1 overflow-y-auto p-6 flex flex-col gap-2 bg-repeat"
        style={{ 
          backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded20.png')`,
          opacity: 0.98
         }}
      >
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.uid;
          const isImage = msg.type === 'image';
          const isFile = msg.type === 'file';

          return (
            <div
              key={msg.id}
              onContextMenu={(e) => handleContextMenu(e, msg)}
              onTouchStart={(e) => {
                const timer = setTimeout(() => handleContextMenu(e, msg), 600);
                e.currentTarget.addEventListener('touchend', () => clearTimeout(timer), { once: true });
              }}
              className={`max-w-[85%] md:max-w-md p-2.5 rounded-xl shadow-sm transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 select-none ${
                isMe
                  ? 'bg-[#dcf8c6] dark:bg-[#005c4b] text-gray-900 dark:text-white self-end rounded-tr-none'
                  : 'bg-white dark:bg-[#202c35] text-gray-900 dark:text-gray-100 self-start rounded-tl-none'
              } ${isImage ? 'p-1 max-w-[240px] md:max-w-[280px]' : 'px-3 md:px-4 py-2.5'} ${msg.isDeleted ? 'opacity-60 italic' : ''}`}
            >
              {isImage && msg.fileURL && (
                <a href={msg.fileURL} target="_blank" rel="noreferrer" className="overflow-hidden rounded-lg block cursor-zoom-in">
                  <img src={msg.fileURL} alt="Sent" className="h-auto w-full max-h-[300px] object-cover hover:scale-102 transition-transform duration-200" />
                </a>
              )}

              {isFile && msg.fileURL && (
                <a 
                  href={msg.fileURL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-blue-600 dark:text-blue-400 font-medium text-xs mb-1"
                >
                  <FileText size={24} className="text-gray-500 dark:text-gray-400" />
                  <span className="truncate max-w-[140px] md:max-w-[180px] text-gray-800 dark:text-gray-200">{msg.text || 'Descargar archivo'}</span>
                </a>
              )}

              {(!isImage && !isFile) && (
                <p className="break-words leading-relaxed text-sm md:text-base with-emoji-support">
                  {msg.text}
                  {msg.isEdited && !msg.isDeleted && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-400 ml-1.5 select-none">(editado)</span>
                  )}
                </p>
              )}
              
              <div className="flex items-center justify-end gap-1 mt-1 select-none">
                <span className="text-[9px] text-gray-500 dark:text-gray-400">
                  {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                </span>

                {isMe && (
                  <div>
                    {msg.read ? (
                      <span className="text-blue-500 font-bold text-xs leading-none" title="Leído">✓✓</span>
                    ) : (
                      <span className="text-gray-400 font-bold text-xs leading-none" title="Enviado">✓</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {contextMenu && (
        <div
          ref={menuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed bg-white dark:bg-[#253138] shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 py-1.5 w-40 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            onClick={startEditMode}
            className="w-full px-4 py-2 text-left text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#182229] flex items-center gap-2 transition-colors"
          >
            <Pencil size={14} className="text-blue-500" />
            Editar mensaje
          </button>
          <hr className="border-gray-200 dark:border-gray-700 my-1" />
          <button
            onClick={() => {
              deleteMessage(contextMenu.messageId);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 transition-colors"
          >
            <Trash2 size={14} />
            Eliminar para todos
          </button>
        </div>
      )}

      {uploadProgress !== null && (
        <div className="absolute bottom-16 md:bottom-4 right-4 bg-white dark:bg-[#202c35] p-3 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 flex items-center gap-3 animate-bounce z-20 text-xs font-medium text-gray-700 dark:text-gray-300">
          <Loader2 size={16} className="animate-spin text-blue-500" />
          <span>Subiendo multimedia: {uploadProgress}%</span>
        </div>
      )}

      {editingMessage && (
        <div className="px-4 md:px-6 py-2 bg-blue-50 dark:bg-[#18252d] border-l border-gray-300 dark:border-gray-700 flex items-center justify-between animate-in slide-in-from-bottom-2 text-xs font-medium text-blue-600 dark:text-blue-400 border-b border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center gap-2 truncate">
            <Pencil size={14} />
            <span className="truncate">Editando mensaje: <span className="italic text-gray-500 dark:text-gray-400">"{editingMessage.text}"</span></span>
          </div>
          <button onClick={cancelEditMode} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full">
            <X size={14} />
          </button>
        </div>
      )}

      {showCameraModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#202c35] border border-gray-700 rounded-2xl overflow-hidden max-w-md w-full shadow-2xl relative flex flex-col">
            <header className="p-4 flex items-center justify-between border-b border-gray-700 bg-[#111b20]">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Camera size={16} className="text-blue-400" /> Cámara Mikigram
              </h3>
              <button onClick= {stopCamera} className="text-gray-400 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </header>

            <div className="bg-black relative aspect-video flex items-center justify-center">
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover transform -scale-x-100"
              />
              {!cameraStream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 text-xs">
                  <Loader2 size={24} className="animate-spin text-blue-500"/>
                  Iniciando lente de la cámara .....
                </div>
              )}
            </div>

            <footer className="p-4 bg-[#111b20] flex justify-center gap-4">
              <button
                onClick={stopCamera}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg text-xs hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={capturePhoto}
                disabled={!cameraStream}
                className="px-5 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-md active:scale-95 transition-all"
              >
                Tomar Foto
              </button>
            </footer>
          </div>
        </div>
      )}

      {showVideoCall && (
        <VideoCallModal
          chatId={selectedChat}
          currentUserId={user?.uid || ''}
          recipientId={(activeRecipient as any)?.uid || ''}
          recipientName={activeRecipient?.displayName || 'Ususario'}
          isIncoming={isIncomingCall}
          onClose={() => setShowVideoCall(false)}
        />
      )}

      <footer className="p-2 md:p-4 bg-[#f0f2f5] dark:bg-[#202c35] border-l border-gray-300 dark:border-gray-700 flex items-center gap-2 md:gap-4">
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-[65px] left-2 right-2 z-50 shadow-2xl max-w-[95vw] md:max-w-[560px]">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              autoFocusSearch={false}
              theme={Theme.AUTO}
              emojiStyle={EmojiStyle.TWITTER}
              width="100%"
              height={380}
            />
          </div>
        )}
                
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*, application/pdf, text/plain, application/zip"
        />

        <div className="flex gap-2 md:gap-4 text-gray-500 dark:text-gray-400 flex-shrink-0">
          <Smile 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`cursor-pointer transition-colors ${showEmojiPicker ? 'text-blue-500 dark:text-blue-400' : 'hover:text-gray-700 dark:hover:text-gray-200'}`}
            size={20} 
          />
          <Camera
            onClick={startCamera}
            className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            size={20}
          />
          <Paperclip
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors" 
            size={20}
          />
        </div>

        <form onSubmit={handleSend} className="flex-1 flex gap-2">
          <input
            value={text}
            onChange={handleInputChange}
            className="flex-1 bg-white dark:bg-[#2a3942] border-none outline-none p-2 px-4 md:p-2.5 md:px-4 rounded-lg text-sm text-gray-700 dark:text-gray-200 shadow-inner placeholder-gray-400 min-w-0 with-emoji-support"
            placeholder={editingMessage ? "Modifica tu mensaje aquí..." : "Escribe un mensaje aquí ....."}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className={`${
              editingMessage ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'
            } disabled:opacity-40 text-white p-2 md:p-2.5 rounded-lg transition-all shadow-md active:scale-95 flex-shrink-0`}
          >
            <Send size={20} />
          </button>
        </form>
      </footer>
    </section>
  );
}