
import React, { useState } from 'react';
import { generateHoleImage } from '../services/geminiService';
import Spinner from './Spinner';

const HoleDesigner: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your dream hole.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const imageUrl = await generateHoleImage(prompt);
      if (imageUrl) {
        setGeneratedImage(imageUrl);
      } else {
        setError('The model could not generate an image for this prompt. Try being more descriptive.');
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-green-400">Dream Hole Designer</h2>
        <p className="text-gray-400 mt-2">Describe your perfect golf hole, and let AI bring it to life.</p>
      </div>

      <div className="flex flex-col space-y-4 mb-6">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A par 3 over a canyon, with a waterfall behind the green and cherry blossom trees..."
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none resize-none h-28"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full md:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      {error && <p className="text-red-400 text-center mb-4">{error}</p>}
      
      <div className="flex-grow flex items-center justify-center bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
        {isLoading && <Spinner size="16" />}
        {!isLoading && generatedImage && (
          <img src={generatedImage} alt="Generated golf hole" className="object-contain w-full h-full" />
        )}
        {!isLoading && !generatedImage && (
          <div className="text-center text-gray-500 p-4">
            <p className="text-lg">Your generated image will appear here.</p>
            <p className="text-sm">Try to be descriptive for the best results!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HoleDesigner;
