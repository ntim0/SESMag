'use client';

import { FC } from 'react';

interface FeeAvatarProps {
  size?: 'small' | 'medium' | 'large';
}

const FeeAvatar: FC<FeeAvatarProps> = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-10 h-10 text-sm',
    large: 'w-16 h-16 text-2xl',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg`}
    >
      F
    </div>
  );
};

export default FeeAvatar;
