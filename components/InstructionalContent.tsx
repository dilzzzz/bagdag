import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, MessageAuthor } from '../types';
import { sendInstructionalMessage } from '../services/geminiService';
import { SendIcon } from './icons';
import Message from './Message';
import Spinner from './Spinner';

const InstructionalContent: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { author: MessageAuthor.AI, text: "Welcome to The Golf Guru! How can I help you improve your game today? Ask me for drills, technique breakdowns, or mental game tips." }
  ]);
  const [input, setInput] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);
  
  const handleSendMessage = useCallback(async () => {
    const currentInput = input.trim();
    if (!currentInput) return;

    setIsStreaming(true);
    setInput('');
    
    // User message
    const userMessage: ChatMessage = { author: MessageAuthor.User, text: currentInput };
    setMessages(prev => [...prev, userMessage]);
    
    // AI Response
    try {
        const stream = await sendInstructionalMessage(currentInput);
        let currentAiMessage = '';
        setMessages(prev => [...prev, { author: MessageAuthor.AI, text: '' }]);
        
        for await (const chunk of stream) {
            currentAiMessage += chunk.text;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = currentAiMessage;
                return newMessages;
            });
        }
    } catch (error) {
        console.error("Error communicating with AI:", error);
        setMessages(prev => [...prev, { author: MessageAuthor.AI, text: "Sorry, I'm having trouble connecting. Please try again later." }]);
    } finally {
        setIsStreaming(false);
    }
  }, [input]);


  return (
    <div className="flex flex-col h-full bg-gray-800 text-white">
      <header className="p-4 border-b border-gray-700 shadow-md">
        <h2 className="text-xl font-semibold text-green-400">Instructional Content</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg, index) => <Message key={index} message={msg} />)}
          {isStreaming && messages[messages.length-1].author === MessageAuthor.User && (
            <div className="flex items-start gap-4 my-4">
                 <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-600 flex items-center justify-center"><Spinner size="6" color="text-white" /></div>
                 <div className="bg-gray-700 p-4 rounded-xl shadow-md"><p className="text-gray-400">Thinking...</p></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 md:p-6 border-t border-gray-700">
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center bg-gray-700 p-2 rounded-lg">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isStreaming && handleSendMessage()}
                placeholder="e.g., 'How do I fix my slice?'"
                className="flex-1 bg-transparent text-white focus:outline-none px-3"
                disabled={isStreaming}
              />
              <button
                onClick={handleSendMessage}
                disabled={isStreaming || !input}
                className="p-2 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                <SendIcon className="h-6 w-6" />
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionalContent;
