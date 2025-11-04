import React, { useState, useEffect, useCallback } from 'react';
import { Topic } from './types';
import { generateTopics } from './services/geminiService';
import Header from './components/Header';
import TopicCard from './components/TopicCard';
import Spinner from './components/Spinner';
import ThumbnailPreview from './components/ThumbnailPreview';
import VoiceoverStudio from './components/VoiceoverStudio';

const App: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateTopics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSelectedTopic(null);
    try {
      const newTopics = await generateTopics();
      setTopics(newTopics);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Failed to generate topics: ${err.message}`
          : 'An unknown error occurred.'
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    handleGenerateTopics();
  }, [handleGenerateTopics]);

  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    window.scrollTo(0, 0);
  };
  
  const handleBackToTopics = () => {
    setSelectedTopic(null);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center h-64">
          <Spinner />
          <p className="mt-4 text-lg text-cyan-400 animate-pulse">
            Igniting Viral Ideas with Gemini...
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-8 bg-red-900/50 border border-red-500 rounded-lg">
          <p className="text-xl font-bold text-red-400">Oops! Something went wrong.</p>
          <p className="mt-2 text-red-300">{error}</p>
          <button
            onClick={handleGenerateTopics}
            className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-md font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    
    if (selectedTopic) {
      return (
        <div>
          <button 
            onClick={handleBackToTopics}
            className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-fuchsia-600 hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500 focus:ring-offset-slate-900 transition-transform hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Topics
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ThumbnailPreview topic={selectedTopic} />
              <VoiceoverStudio topic={selectedTopic} />
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                Choose a Viral Idea
            </h2>
            <button
                onClick={handleGenerateTopics}
                className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 rounded-md font-semibold transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V4a1 1 0 011-1zm10 8a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 111.885-.666A5.002 5.002 0 0014.001 13H11a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Regenerate
            </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {topics.map((topic, index) => (
            <TopicCard key={`${topic.title}-${index}`} topic={topic} onSelect={handleSelectTopic} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;