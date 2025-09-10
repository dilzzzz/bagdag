
import React from 'react';
import { ChatMessage, MessageAuthor } from '../types';
import { GolfIcon } from './icons';

// Using a markdown parser would be better for full markdown support,
// but for simple bolding and lists, this is a lightweight approach.
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const processText = (txt: string) => {
    return txt
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>'); // List items
  };

  return <div dangerouslySetInnerHTML={{ __html: processText(text) }} />;
};

const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.author === MessageAuthor.User;

  return (
    <div className={`flex items-start gap-4 my-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
          <GolfIcon className="h-6 w-6 text-white" />
        </div>
      )}
      <div className={`max-w-xl p-4 rounded-xl shadow-md ${isUser ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
        {message.image && (
          <img src={message.image} alt="User upload" className="rounded-lg mb-2 max-h-64" />
        )}
        <div className="prose prose-invert prose-p:my-2 prose-strong:text-white">
           <SimpleMarkdown text={message.text} />
        </div>
      </div>
    </div>
  );
};

export default Message;
