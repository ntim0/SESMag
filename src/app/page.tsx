'use client';

import { useState, useRef, useEffect } from 'react';
import ChatMessage from '@/components/ChatMessage';
import FileUploadZone from '@/components/FileUploadZone';
import FeeAvatar from '@/components/FeeAvatar';
import Sidebar from '@/components/Sidebar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface UploadedFile {
  id: string;
  originalName: string;
  size: number;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (uploadedFiles: File[]) => {
    const formData = new FormData();
    uploadedFiles.forEach((file) => {
      formData.append('files', file);
    });
    if (conversationId) {
      formData.append('conversationId', conversationId);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.conversationId) setConversationId(data.conversationId);
      if (data.files) setFiles((prev) => [...prev, ...data.files]);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload files');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: input,
          fileIds: files.map((f) => f.id),
        }),
      });

      const data = await response.json();

      if (data.conversationId) setConversationId(data.conversationId);

      const assistantMessage: Message = {
        id: Date.now().toString() + '_a',
        role: 'assistant',
        content: data.reply,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat failed:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur border-b border-indigo-200 px-6 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <FeeAvatar />
            <div>
              <h1 className="text-2xl font-bold text-indigo-900">Fee SESMag Agent</h1>
              <p className="text-sm text-gray-600">Your SESMag document reviewer</p>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FeeAvatar size="large" />
                <h2 className="mt-4 text-2xl font-bold text-indigo-900">Welcome to Fee SESMag Agent</h2>
                <p className="text-gray-600 mt-2">Upload PDF documents and ask Fee for SESMag reviews</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))
          )}
          {loading && (
            <div className="flex gap-2 items-center">
              <FeeAvatar size="small" />
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-indigo-200 bg-white/80 backdrop-blur px-4 lg:px-8 py-6 space-y-4">
          <FileUploadZone onFilesSelected={handleFileUpload} />

          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((file) => (
                <div key={file.id} className="bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  📄 {file.originalName}
                  <button
                    onClick={() => setFiles(files.filter((f) => f.id !== file.id))}
                    className="text-indigo-600 hover:text-indigo-800 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Fee for a SESMag review..."
              className="flex-1 border-2 border-indigo-300 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
