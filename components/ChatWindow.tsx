// 1. Agregar el nuevo estado junto a los demás estados de llamadas:
const [isAudioOnlyCall, setIsAudioOnlyCall] = useState(false);

// 2. Modificar el listener de Firebase (useEffect) para capturar el modo 'isAudioOnly':
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
            setIsAudioOnlyCall(!!data.offer.isAudioOnly); // Captura si es solo audio
            setShowVideoCall(true);
        }
    }, (err) => {
        console.error("Error en listener de llamada:", err);
    });
    return () => unsubscribe();
}, [selectedChat, user?.uid]);

// 3. Modificar los botones de Video y Phone en el Header:
<div className="flex items-center gap-5 text-gray-500 dark:text-gray-400">
  <Video
    onClick={() => {
      setIsIncomingCall(false);
      setIsAudioOnlyCall(false); // Es llamada de video
      setShowVideoCall(true);
    }}
    size={20} 
    className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors" 
  />
  <Phone 
    onClick={() => {
      setIsIncomingCall(false);
      setIsAudioOnlyCall(true); // Es llamada de audio/teléfono
      setShowVideoCall(true);
    }}
    size={16} 
    className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors" 
  />
</div>

// 4. Actualizar el renderizado de VideoCallModal al final del JSX:
{showVideoCall && (
  <VideoCallModal
    chatId={selectedChat}
    currentUserId={user?.uid || ''}
    recipientId={(activeRecipient as any)?.uid || ''}
    recipientName={activeRecipient?.displayName || 'Usuario'}
    recipientPhoto={activeRecipient?.photoURL || undefined}
    isIncoming={isIncomingCall}
    isAudioOnly={isAudioOnlyCall} // Se envía si es llamada telefónica
    onClose={() => setShowVideoCall(false)}
  />
)}