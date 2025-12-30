import { ChatMessage } from '@/lib/types';
import { MessageSquare, User, Bot } from 'lucide-react';



export default function ChatHistory({
  messages
}: {
  messages: ChatMessage[];
}) {
  if (!messages || messages.length === 0) return null;

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <div className="flex items-center gap-2 mb-3 text-gray-800 font-semibold">
        <MessageSquare size={16} />
        <span>Chat History</span>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
        {messages.map((msg:ChatMessage, idx) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={idx}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm
                  ${
                    isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }
                `}
              >
                <div className="flex items-center gap-1 mb-1 text-xs opacity-70">
                  {isUser ? <User size={12} /> : <Bot size={12} />}
                  <span className="capitalize">{msg.role}</span>
                </div>

                <p className="whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
