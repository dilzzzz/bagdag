import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, MessageAuthor } from '../types';
import { sendCoachMessage, analyzeSwingImage } from '../services/geminiService';
import { SendIcon, PaperclipIcon } from './icons';
import Message from './Message';
import Spinner from './Spinner';

const fileToBase64 = (file: File): Promise<{base64: string; mimeType: string}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [header, data] = result.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || file.type;
      resolve({ base64: data, mimeType });
    };
    reader.onerror = error => reject(error);
  });
};

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { author: MessageAuthor.AI, text: "Hello! I'm your Pro AI Caddy. Ask me for swing advice, course strategy, or upload a picture of your swing for analysis." }
  ]);
  const [input, setInput] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);
  
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSendMessage = useCallback(async () => {
    const currentInput = input.trim();
    if (!currentInput && !imageFile) return;

    setIsStreaming(true);
    setInput('');
    
    // User message
    const userMessage: ChatMessage = { author: MessageAuthor.User, text: currentInput };
    if (imagePreview) {
        userMessage.image = imagePreview;
    }
    setMessages(prev => [...prev, userMessage]);

    // Reset image state after adding to message
    const fileForAnalysis = imageFile; // Capture file before resetting
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // AI Response
    try {
        if (fileForAnalysis) {
            const { base64, mimeType } = await fileToBase64(fileForAnalysis);
            // The prompt for swing analysis is handled within the service
            const aiResponseText = await analyzeSwingImage(base64, mimeType);
            setMessages(prev => [...prev, { author: MessageAuthor.AI, text: aiResponseText }]);
        } else {
            const stream = await sendCoachMessage(currentInput);
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
        }
    } catch (error) {
        console.error("Error communicating with AI:", error);
        setMessages(prev => [...prev, { author: MessageAuthor.AI, text: "Sorry, I'm having trouble connecting. Please try again later." }]);
    } finally {
        setIsStreaming(false);
    }
  }, [input, imageFile, imagePreview]);


  return (
    <div className="flex flex-col h-full bg-gray-800 text-white">
      <header className="p-4 border-b border-gray-700 shadow-md">
        <h2 className="text-xl font-semibold text-green-400">AI Coach & Swing Analyzer</h2>
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
            {imagePreview && (
                <div className="mb-2 p-2 bg-gray-700 rounded-lg inline-block relative">
                    <img src={imagePreview} alt="Preview" className="h-20 rounded" />
                    <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">X</button>
                </div>
            )}
            <div className="flex items-center bg-gray-700 p-2 rounded-lg">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden" 
              />
              <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-green-400" aria-label="Attach image">
                  <PaperclipIcon className="h-6 w-6" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isStreaming && handleSendMessage()}
                placeholder={imageFile ? "Add a comment... (optional)" : "Ask your AI Caddy..."}
                className="flex-1 bg-transparent text-white focus:outline-none px-3"
                disabled={isStreaming}
              />
              <button
                onClick={handleSendMessage}
                disabled={isStreaming || (!input.trim() && !imageFile)}
                className="p-2 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <SendIcon className="h-6 w-6" />
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;