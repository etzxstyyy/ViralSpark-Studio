import React from 'react';
import { Topic } from '../types';

interface ThumbnailPreviewProps {
  topic: Topic;
}

const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({ topic }) => {
  const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(topic.image_query)}/1280/720`;

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
        Thumbnail Preview
      </h3>
      <div className="aspect-video w-full bg-cover bg-center rounded-lg overflow-hidden relative shadow-inner-lg" style={{ backgroundImage: `url(${imageUrl})` }}>
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-4">
          <h2 className="font-bebas text-4xl md:text-5xl lg:text-6xl text-white text-center uppercase tracking-wider" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
            {topic.title}
          </h2>
        </div>
      </div>
      <div className="mt-4 text-center">
        <a 
            href={imageUrl} 
            download={`thumbnail_${topic.title.replace(/\s+/g, '_')}.jpg`}
            className="inline-block px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md font-semibold transition-colors"
        >
            Download Image
        </a>
        <p className="text-xs text-slate-500 mt-2">(Note: Text overlay not included in download)</p>
      </div>
    </div>
  );
};

export default ThumbnailPreview;
