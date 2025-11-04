import React from 'react';
import { Topic } from '../types';

interface TopicCardProps {
  topic: Topic;
  onSelect: (topic: Topic) => void;
}

const TopicCard: React.FC<TopicCardProps> = ({ topic, onSelect }) => {
  const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(topic.image_query)}/500/800`;

  return (
    <div className="group relative overflow-hidden rounded-xl shadow-lg bg-slate-800 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-fuchsia-800/20">
      <img src={imageUrl} alt={topic.title} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
      
      <div className="absolute bottom-0 left-0 p-4 w-full">
         <span className="inline-block bg-fuchsia-500/80 text-white text-xs font-semibold px-2 py-1 rounded-full mb-2">
            {topic.content_type}
        </span>
        <h3 className="text-lg font-bold text-white leading-tight">{topic.title}</h3>
        <p className="text-sm text-gray-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-h-0 group-hover:max-h-20 overflow-hidden">
            {topic.hook}
        </p>
      </div>

      <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => onSelect(topic)}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-bold rounded-lg shadow-lg transform transition-transform hover:scale-110"
        >
          Create Content
        </button>
      </div>
    </div>
  );
};

export default TopicCard;
