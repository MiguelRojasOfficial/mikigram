'use client'

import { useState } from 'react';
import { UserProfile } from '@/lib/userService';
import { Eye, Settings, Grid, Heart, Lock, Edit3 } from 'lucide-react';

interface ProfileViewProps {
    user: UserProfile;
    isOwnProfile?: boolean;
}

export default function ProfileView({ user, isOwnProfile = true }: ProfileViewProps) {
    const [activeTab, setActiveTab] = useState<'posts' | 'likes' | 'private'>('posts');
    const [showVisitors, setShowVisitors] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#111b20] pb-24 text-gray-900 dark:text-white">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1f2c34]">
                <h1 className="text-lg font-bold">@{user.displayName.toLowerCase().replace(/\s+/g, '')}</h1>
                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    <Settings size={20} />
                </button>
            </div>

            <div className="flex flex-col items-center pt-6 px-4">
                <div className="relative mb-3">
                    <img 
                        src={user.photoURL} 
                        alt={user.displayName} 
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-500/20 shadow-md"
                    />
                    {isOwnProfile && (
                        <button 
                            onClick={() => setShowVisitors(!showVisitors)}
                            title="Ver quién visitó tu perfil"
                            className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow border-2 border-white dark:border-[#111b20] transition active:scale-95"
                        >
                            <Eye size={14} />
                        </button>
                    )}
                </div>

                <h2 className="text-xl font-bold">{user.displayName}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center max-w-xs">{user.bio}</p>

                <div className="flex items-center gap-6 my-5">
                    <div className="text-center">
                        <span className="block font-bold text-lg">{user.followingCount}</span>
                        <span className="text-xs text-gray-400">Siguiendo</span>
                    </div>
                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-800"></div>
                    <div className="text-center">
                        <span className="block font-bold text-lg">{user.followersCount}</span>
                        <span className="text-xs text-gray-400">Seguidores</span>
                    </div>
                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-800"></div>
                    <div className="text-center">
                        <span className="block font-bold text-lg">{user.likesCount}</span>
                        <span className="text-xs text-gray-400">Me Gusta</span>
                    </div>
                </div>

                {isOwnProfile && (
                    <button className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 font-semibold px-6 py-2.5 rounded-xl text-sm transition">
                        <Edit3 size={16} />
                        Editar perfil
                    </button>
                )}
            </div>

            {showVisitors && (
                <div className="mx-4 my-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs">
                    <p className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Visitas recientes a tu perfil:</p>
                    <p className="text-gray-600 dark:text-gray-400">
                        {user.profileViews && user.profileViews.length > 0 
                            ? `${user.profileViews.length} personas han visto tu perfil recientemente.` 
                            : 'Aún no hay visitas registradas hoy.'}
                    </p>
                </div>
            )}

            <div className="mt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex justify-around border-b border-gray-200 dark:border-gray-800">
                    <button 
                        onClick={() => setActiveTab('posts')}
                        className={`flex-1 py-3 flex justify-center border-b-2 transition ${
                            activeTab === 'posts' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400'
                        }`}
                    >
                        <Grid size={20} />
                    </button>
                    <button 
                        onClick={() => setActiveTab('likes')}
                        className={`flex-1 py-3 flex justify-center border-b-2 transition ${
                            activeTab === 'likes' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400'
                        }`}
                    >
                        <Heart size={20} />
                    </button>
                    <button 
                        onClick={() => setActiveTab('private')}
                        className={`flex-1 py-3 flex justify-center border-b-2 transition ${
                            activeTab === 'private' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400'
                        }`}
                    >
                        <Lock size={20} />
                    </button>
                </div>

                <div className="p-1">
                    {activeTab === 'posts' && (
                        <div className="grid grid-cols-3 gap-1">
                            <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center text-xs text-gray-400">
                                Sin estados
                            </div>
                        </div>
                    )}
                    {activeTab === 'likes' && (
                        <div className="p-8 text-center text-sm text-gray-400">
                            Los videos y estados que te gusten aparecerán aquí.
                        </div>
                    )}
                    {activeTab === 'private' && (
                        <div className="p-8 text-center text-sm text-gray-400">
                            Tus estados guardados en privado.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}