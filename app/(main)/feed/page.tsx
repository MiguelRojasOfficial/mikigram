'use client'

import { useState } from 'react';
import { Heart, MessageCircle, Share2, Download, PlusCircle } from 'lucide-react';

export default function FeedPage() {
    const [liked, setLiked] = useState(false);

    return (
        <div className="h-full w-full bg-black flex items-center justify-center relative overflow-hidden">
            <div className="w-full max-w-sm h-full md:h-[92%] bg-gray-900 md:rounded-2xl relative flex flex-col justify-between p-4 overflow-hidden shadow-2xl border border-gray-800">
                <div className="flex items-center justify-between z-10 pt-2">
                    <div className="flex items-center gap-3">
                        <img 
                            src="https://api.dicebear.com/7.x/adventurer/svg?seed=mikigram_demo" 
                            alt="Foto" 
                            className="w-10 h-10 rounded-full border-2 border-blue-500"
                        />
                        <div>
                            <p className="text-white font-bold text-sm">@amigo_demo</p>
                            <p className="text-gray-400 text-xs">Hace 10 min</p>
                        </div>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                        <PlusCircle size={14} /> Seguir
                    </button>
                </div>

                <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
                    <p className="text-gray-500 text-sm">Aquí se reproducirá el estado vertical (Video/Foto)</p>
                </div>

                <div className="absolute right-3 bottom-20 flex flex-col items-center gap-5 z-10">
                    <button 
                        onClick={() => setLiked(!liked)}
                        className="flex flex-col items-center text-white"
                    >
                        <div className={`p-3 rounded-full bg-black/40 backdrop-blur-md transition ${liked ? 'text-red-500 scale-110' : 'text-white'}`}>
                            <Heart size={24} fill={liked ? 'currentColor' : 'none'} />
                        </div>
                        <span className="text-xs font-medium mt-1">12.4k</span>
                    </button>

                    <button className="flex flex-col items-center text-white">
                        <div className="p-3 rounded-full bg-black/40 backdrop-blur-md">
                            <MessageCircle size={24} />
                        </div>
                        <span className="text-xs font-medium mt-1">342</span>
                    </button>

                    <button className="flex flex-col items-center text-white">
                        <div className="p-3 rounded-full bg-black/40 backdrop-blur-md">
                            <Share2 size={24} />
                        </div>
                        <span className="text-xs font-medium mt-1">Compartir</span>
                    </button>

                    <button className="flex flex-col items-center text-white">
                        <div className="p-3 rounded-full bg-black/40 backdrop-blur-md">
                            <Download size={24} />
                        </div>
                        <span className="text-xs font-medium mt-1">Guardar</span>
                    </button>
                </div>

                <div className="z-10 pb-4 pr-14">
                    <p className="text-white text-sm font-medium">Probando la nueva interfaz de Mikigram! 🚀</p>
                </div>
            </div>
        </div>
    );
}