'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Building2, Minimize2, X, Circle } from 'lucide-react';
import ApartmentCard from './ApartmentCard';
import { Message, Apartment } from '@/lib/types';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Send initial greeting
    const initChat = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: 'გამარჯობა',
            sessionId: null 
          })
        });

        const data = await response.json();
        
        if (data.sessionId) {
          setSessionId(data.sessionId);
        }

        setMessages([{
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          apartments: data.apartments
        }]);
      } catch (error) {
        console.error('Init error:', error);
      }
      setIsLoading(false);
    };

    initChat();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          sessionId 
        })
      });

      const data = await response.json();

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        apartments: data.apartments || null
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Send message error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your message. Please try again.',
        timestamp: new Date()
      }]);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 bg-gray-900 text-white p-4 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
      >
        <Building2 size={24} />
      </button>
    );
  }

 return (
  <div className="fixed bottom-6 right-6 w-full max-w-md h-[600px] bg-white rounded-2xl shadow-xl flex flex-col border border-gray-200 overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between px-5 py-3 border-b bg-amber-300 z-10 border-red-200 bg-gray-50">
      <div className="flex items-center gap-3">
        <div className="bg-gray-900 p-2 rounded-lg">
          <Building2 size={20} className="text-white" />
        </div>
        <div>
          <div className="font-semibold text-gray-900 text-sm">
            Real Estate Assistant
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Circle size={8} className="fill-green-500 text-green-500" />
            <span>Online</span>
          </div>
        </div>
      </div>
      <button
        onClick={() => setIsMinimized(true)}
        className="p-1 hover:bg-gray-200 rounded transition-colors"
      >
        <Minimize2 size={18} className="text-gray-600" />
      </button>
    </div>

    {/* Messages */}
    <div className="flex-1 px-4 py-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" ref={messagesEndRef}>
      {messages.map((msg, idx) => (
        <div key={idx} className={`flex px-5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`relative max-w-[75%] px-4 py-2 rounded-xl shadow ${msg.role === 'user' ? 'bg-gray-900 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}>
            <div className="whitespace-pre-wrap text-sm px-5">{msg.content}</div>
            
            {msg.apartments && msg.apartments.length > 0 && (
              <div className="mt-3 space-y-2">
                {msg.apartments.map((apt) => (
                  <>
                  
                  <h1 className='w-10 text-2xl text-emerald-600'>ბარათი</h1>
                  <ApartmentCard key={apt._id?.toString()} apartment={apt} />
                  </>
                ))}
              </div>
            )}
            
            <div className={`absolute bottom-1 right-3 text-[10px] ${msg.role === 'user' ? 'text-gray-400' : 'text-gray-500'}`}>
              {new Date(msg?.timestamp ||  Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-xl px-4 py-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Input */}
    <div className="border-t border-gray-200 px-4 py-3 bg-white">
      <div className="flex items-center gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
          rows={1}
          style={{ maxHeight: '120px' }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="bg-gray-900 text-white p-2 rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={20} />
        </button>
      </div>
      <div className="text-xs text-gray-400 mt-1">
        Press Enter to send, Shift+Enter for newline
      </div>
    </div>
  </div>
);

}