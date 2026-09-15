'use client';

import { useEffect, useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, updateDoc, collection, addDoc } from 'firebase/firestore';
import { PhoneOff, Video, VideoOff, Mic, MicOff, Loader2, Phone } from 'lucide-react';

interface VideoCallModalProps {
    chatId: string;
    currentUserId: string;
    recipientId: string;
    recipientName: string;
    recipientPhoto?: string;
    onClose: () => void;
    isIncoming?: boolean;
    isAudioOnly?: boolean; // Nuevo prop para llamadas de solo voz
}

const iceServers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ],
};

export default function VideoCallModal({
    chatId,
    currentUserId,
    recipientId,
    recipientName,
    recipientPhoto,
    onClose,
    isIncoming = false,
    isAudioOnly = false,
}: VideoCallModalProps) {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [callStatus, setcallStatus] = useState<string>(isIncoming ? 'Llamada entrante.....' : 'Llamando.....');
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(!isAudioOnly);
    
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const callDocRef = doc(db, 'chats', chatId, 'call', 'current');
    const isEndingRef = useRef(false);

    useEffect(() => {
        let unsubCallDoc: (() => void) | null = null;
        let unsubCandidates: (() => void) | null = null;
        let localMediaStream: MediaStream | null = null;

        const initCall = async () => {
            try {
                // Solicitar video solo si NO es llamada de solo audio
                localMediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: !isAudioOnly, 
                    audio: true 
                });
                setLocalStream(localMediaStream);
                if (localVideoRef.current && !isAudioOnly) {
                    localVideoRef.current.srcObject = localMediaStream;
                }

                const pc = new RTCPeerConnection(iceServers);
                peerConnection.current = pc;
                
                localMediaStream.getTracks().forEach((track) => pc.addTrack(track, localMediaStream!));
                
                pc.ontrack = (event) => {
                    const [remote] = event.streams;
                    setRemoteStream(remote);
                    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;
                    setcallStatus('En llamada');
                };

                if (!isIncoming) {
                    // --- FLUX EMISOR ---
                    const iceCandidatesCol = collection(callDocRef, 'callerCandidates');
                    pc.onicecandidate = (event) => {
                        if (event.candidate) addDoc(iceCandidatesCol, event.candidate.toJSON());
                    };

                    const offerDescription = await pc.createOffer();
                    await pc.setLocalDescription(offerDescription);

                    const offer = {
                        sdp: offerDescription.sdp,
                        type: offerDescription.type,
                        callerId: currentUserId,
                        isAudioOnly: isAudioOnly,
                        status: 'ringing', 
                    };
                    await setDoc(callDocRef, { offer, status: 'ringing', isAudioOnly });

                    unsubCallDoc = onSnapshot(callDocRef, async (snapshot) => {
                        const data = snapshot.data();
                        if (data?.answer && !pc.currentRemoteDescription) {
                            const answerDescription = new RTCSessionDescription(data.answer);
                            await pc.setRemoteDescription(answerDescription);
                        }
                        if (data?.status === 'ended' && !isEndingRef.current) {
                            closeStreamsAndUI();
                        }
                    });

                    unsubCandidates = onSnapshot(collection(callDocRef, 'calleeCandidates'), (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === 'added') {
                                const candidate = new RTCIceCandidate(change.doc.data());
                                pc.addIceCandidate(candidate).catch(e => console.log("ICE Error Emisor:", e));
                            }
                        });
                    });
                } else {
                    // --- FLUX RECEPTOR ---
                    setcallStatus('Conectando...');
                                
                    const iceCandidatesCol = collection(callDocRef, 'calleeCandidates');
                    pc.onicecandidate = (event) => {
                        if (event.candidate) addDoc(iceCandidatesCol, event.candidate.toJSON());
                    };

                    unsubCallDoc = onSnapshot(callDocRef, async (snap) => {
                        const data = snap.data();
                        if (!data) return;

                        if (data.status === 'ended' && !isEndingRef.current) {
                            closeStreamsAndUI();
                            return;
                        }

                        if (data.offer && !data.answer && !pc.currentRemoteDescription) {
                            try {
                                await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
                                const answerDescription = await pc.createAnswer();
                                await pc.setLocalDescription(answerDescription);
                                await updateDoc(callDocRef, {
                                    status: 'accepted',
                                    answer: { type: answerDescription.type, sdp: answerDescription.sdp } 
                                });
                            } catch (e) {
                                console.error("Error al responder llamada:", e);
                            }
                        }
                    });

                    unsubCandidates = onSnapshot(collection(callDocRef, 'callerCandidates'), (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === 'added') {
                                const candidate = new RTCIceCandidate(change.doc.data());
                                pc.addIceCandidate(candidate).catch(e => console.log("ICE Error Receptor:", e));
                            }
                        });
                    });
                }
            } catch (err) {
                console.error('Error WebRTC:', err);
                closeStreamsAndUI();
            }
        };

        initCall();

        return () => {
            if (unsubCallDoc) unsubCallDoc();
            if (unsubCandidates) unsubCandidates();
        };
    }, [isIncoming, chatId, isAudioOnly]);

    const closeStreamsAndUI = () => {
        isEndingRef.current = true;
        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
        }
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
        onClose();
    };

    const handleHangUp = async () => {
        if (isEndingRef.current) return;
        try {
            await updateDoc(callDocRef, { status: 'ended' });
        } catch {}
        closeStreamsAndUI();
    };

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks()[0].enabled = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream && !isAudioOnly) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !isVideoOn;
                setIsVideoOn(!isVideoOn);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0b141a] z-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Audio tag oculto pero necesario para reproducir el audio entrante si no hay elemento video */}
            <audio ref={remoteVideoRef as any} autoPlay playsInline />

            <div className="w-full max-w-4xl bg-[#111b20] rounded-3xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col h-[85vh] relative">
                
                {/* ÁREA PRINCIPAL: SI ES SOLO AUDIO O NO HAY VIDEO AÚN */}
                {isAudioOnly ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-[#111b20] to-[#0b141a] p-6">
                        <div className="relative">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-green-500/30 flex items-center justify-center bg-gray-800 shadow-2xl">
                                {recipientPhoto ? (
                                    <img src={recipientPhoto} alt={recipientName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-5xl font-bold text-white">
                                        {recipientName.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 p-3 bg-green-500 rounded-full text-white shadow-lg animate-pulse">
                                <Phone size={20} />
                            </div>
                        </div>

                        <div className="text-center">
                            <h3 className="text-2xl font-semibold text-white mb-1">{recipientName}</h3>
                            <p className="text-sm text-green-400 font-medium flex items-center justify-center gap-2">
                                {callStatus === 'Llamando.....' || callStatus === 'Conectando...' ? (
                                    <Loader2 className="animate-spin" size={16} />
                                ) : null}
                                {callStatus}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                        {remoteStream ? (
                            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center text-gray-400 flex flex-col items-center gap-3">
                                <Loader2 className="animate-spin text-green-500" size={32} />
                                <p className="text-sm font-medium">{callStatus}</p>
                                <p className="text-xs text-gray-600">{recipientName}</p>
                            </div>
                        )}

                        <div className="absolute top-4 right-4 w-32 md:w-44 aspect-video bg-[#202c35] rounded-2xl overflow-hidden shadow-md border border-gray-700 z-10">
                            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                        </div>
                    </div>
                )}

                {/* CONTROLES INFERIORES */}
                <footer className="p-6 bg-[#111b20] border-t border-gray-800 flex items-center justify-center gap-6">
                    <button
                        onClick={toggleMute}
                        className={`p-4 rounded-full transition-all active:scale-95 ${isMuted ? 'bg-red-500 text-white' : 'bg-[#202c35] text-gray-300 hover:text-white'}`}
                        title={isMuted ? "Desactivar silencio" : "Silenciar"}
                    >
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>

                    <button
                        onClick={handleHangUp}
                        className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-900/30"
                        title="Colgar"
                    >
                        <PhoneOff size={25} />
                    </button>

                    {!isAudioOnly && (
                        <button
                            onClick={toggleVideo}
                            className={`p-4 rounded-full transition-all active:scale-95 ${!isVideoOn ? 'bg-red-500 text-white' : 'bg-[#202c35] text-gray-300 hover:text-white'}`}
                            title={isVideoOn ? "Apagar cámara" : "Encender cámara"}
                        >
                            {!isVideoOn ? <VideoOff size={20} /> : <Video size={20} />}
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
}