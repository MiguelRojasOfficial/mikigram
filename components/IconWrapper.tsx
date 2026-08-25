'use client'

import { useEffect, useState } from 'react';
import { 
    MessageSquare, 
    MapPin, 
    PlusCircle, 
    Film, 
    User, 
    ShieldCheck, 
    LucideProps 
} from 'lucide-react';

export type IconName = 'chats' | 'map' | 'create' | 'feed' | 'profile' | 'shield';

interface IconWrapperProps extends LucideProps {
    name: IconName;
    size?: number;
    className?: string;
}

export default function IconWrapper({ name, size = 20, className = '', ...props }: IconWrapperProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <span style={{ width: size, height: size, display: 'inline-block' }} className={className} />;
    }

    switch (name) {
        case 'chats':
            return <MessageSquare size={size} className={className} {...props} />;
        case 'map':
            return <MapPin size={size} className={className} {...props} />;
        case 'create':
            return <PlusCircle size={size} className={className} {...props} />;
        case 'feed':
            return <Film size={size} className={className} {...props} />;
        case 'profile':
            return <User size={size} className={className} {...props} />;
        case 'shield':
            return <ShieldCheck size={size} className={className} {...props} />;
        default:
            return null;
    }
}