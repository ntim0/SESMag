'use client';

import { FC } from 'react';
import FeeAvatar from './FeeAvatar';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
  };
}

const ChatMessage: FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <FeeAvatar size="small" />}
      <div
        className={`max-w-md lg:max-w-2xl px-4 py-3 rounded-lg ${
          isUser
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-white text-gray-900 border-2 border-indigo-200 rounded-bl-none'
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-2 ${isUser ? 'text-indigo-100' : 'text-gray-500'}`}>
          {new Date(message.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
