'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Download, PlusCircle, Loader2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Post {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  mediaUrl: string;
  createdAt: any;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData: Post[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];

      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-full w-full bg-black flex items-center justify-center text-green-500">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="h-full w-full bg-black flex flex-col items-center justify-center text-white p-4">
        <p className="text-gray-400 text-center">No hay estados publicados aún.</p>
        <p className="text-xs text-gray-600 mt-2">Pública uno desde el botón de crear.</p>
      </div>
    );
  }

  const currentPost = posts[currentIndex];

  return (
    <div className="h-full w-full bg-black flex items-center justify-center relative overflow-hidden">
      <div className="w-full max-w-sm h-full md:h-[92%] bg-gray-900 md:rounded-2xl relative flex flex-col justify-between p-4 overflow-hidden shadow-2xl border border-gray-800">
        <div className="flex items-center justify-between z-10 pt-2">
          <div className="flex items-center gap-3">
            <img 
              src={currentPost.userPhoto} 
              alt={currentPost.userName} 
              className="w-10 h-10 rounded-full border-2 border-green-500 object-cover"
            />
            <div>
              <p className="text-white font-bold text-sm">{currentPost.userName}</p>
              <p className="text-gray-400 text-xs">Estado reciente</p>
            </div>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
            <PlusCircle size={14} /> Seguir
          </button>
        </div>

        <div className="absolute inset-0 flex items-center justify-center bg-gray-950">
          <img 
            src={currentPost.mediaUrl} 
            alt="Estado" 
            className="w-full h-full object-cover" 
          />
        </div>

        <div className="absolute right-3 bottom-20 flex flex-col items-center gap-5 z-10">
          <button 
            onClick={() => setLiked(!liked)}
            className="flex flex-col items-center text-white"
          >
            <div className={`p-3 rounded-full bg-black/40 backdrop-blur-md transition ${liked ? 'text-red-500 scale-110' : 'text-white'}`}>
              <Heart size={24} fill={liked ? 'currentColor' : 'none'} />
            </div>
            <span className="text-xs font-medium mt-1">Me gusta</span>
          </button>

          <button className="flex flex-col items-center text-white">
            <div className="p-3 rounded-full bg-black/40 backdrop-blur-md">
              <MessageCircle size={24} />
            </div>
            <span className="text-xs font-medium mt-1">Comentar</span>
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

        {posts.length > 1 && (
          <div className="absolute top-2 left-0 right-0 z-20 flex justify-center gap-1 px-4">
            {posts.map((_, idx) => (
              <div 
                key={idx} 
                onClick={() => setCurrentIndex(idx)}
                className={`h-1 flex-1 rounded-full cursor-pointer ${idx === currentIndex ? 'bg-green-500' : 'bg-gray-600'}`}
              />
            ))}
          </div>
        )}

        <div className="z-10 pb-4 pr-14">
          <p className="text-white text-sm font-medium">Publicado en Mikigram 🚀</p>
        </div>
      </div>
    </div>
  );
}