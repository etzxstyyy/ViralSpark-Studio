import React, { useState } from 'react';
import { Topic } from '../types';
import { VOICE_OPTIONS } from '../constants';
import { generateVoiceover, generateScriptForTopic } from '../services/geminiService';
import Spinner from './Spinner';
import DurationSelector from './DurationSelector';

interface VoiceoverStudioProps {
  topic: Topic;
}

const VoiceoverStudio: React.FC<VoiceoverStudioProps> = ({ topic }) => {
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(VOICE_OPTIONS[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [duration, setDuration] = useState('Auto');
  const [script, setScript] = useState(`${topic.hook} ${topic.description}`);
  const [isScriptGenerating, setIsScriptGenerating] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);

  const handleRegenerateScript = async () => {
    setIsScriptGenerating(true);
    setScriptError(null);
    try {
        const newScript = await generateScriptForTopic(topic, duration);
        setScript(newScript);
    } catch (err) {
        setScriptError(err instanceof Error ? err.message : 'Failed to generate script.');
    } finally {
        setIsScriptGenerating(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);

    const selectedVoice = VOICE_OPTIONS.find(v => v.id === selectedVoiceId);
    if (!selectedVoice) {
      setError("Invalid voice selected.");
      setIsGenerating(false);
      return;
    }

    try {
      const base64Audio = await generateVoiceover(script, selectedVoice.geminiVoice);
      const audioBlob = createWavBlob(base64Audio);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const createWavBlob = (base64: string): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    
    const dataSize = byteArray.length;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    function writeString(view: DataView, offset: number, string: string) {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }
    
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
    view.setUint16(32, numChannels * (bitsPerSample / 8), true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    const pcmAsUint8 = new Uint8Array(byteArray.buffer);
    const dataAsUint8 = new Uint8Array(buffer, 44);
    dataAsUint8.set(pcmAsUint8);

    return new Blob([view], { type: 'audio/wav' });
  };


  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg flex flex-col space-y-4">
      <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
        Voiceover Studio
      </h3>
      
      <div className="bg-slate-900/50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-cyan-300">Script:</p>
            <button
                onClick={handleRegenerateScript}
                disabled={isScriptGenerating}
                className="px-3 py-1 text-xs bg-cyan-600 hover:bg-cyan-700 rounded-md font-semibold transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
            >
                {isScriptGenerating ? <Spinner /> : <span>Regenerate Script</span>}
            </button>
        </div>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          rows={5}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-md p-2 text-slate-300 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition"
          placeholder="Your script goes here..."
        />
         {scriptError && <p className="text-red-400 text-xs mt-1">{scriptError}</p>}
      </div>
      
      <DurationSelector duration={duration} setDuration={setDuration} scriptText={script} />

      <div>
        <p className="text-sm font-semibold text-cyan-300 mb-2">Select a Voice:</p>
        <div className="grid grid-cols-2 gap-3">
          {VOICE_OPTIONS.map(voice => (
            <button
              key={voice.id}
              onClick={() => setSelectedVoiceId(voice.id)}
              className={`p-3 rounded-lg text-left transition-all ${
                selectedVoiceId === voice.id
                  ? 'bg-fuchsia-600 ring-2 ring-fuchsia-400'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <p className="font-bold">{voice.name}</p>
              <p className="text-xs text-slate-300">{voice.style}</p>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-auto">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-bold rounded-lg shadow-lg transform transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isGenerating ? <Spinner /> : 'Generate Voiceover'}
        </button>

        {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}
        
        {audioUrl && (
          <div className="mt-4">
            <audio controls src={audioUrl} className="w-full">
              Your browser does not support the audio element.
            </audio>
            <a 
                href={audioUrl} 
                download={`voiceover_${topic.title.replace(/\s+/g, '_')}.wav`}
                className="block text-center mt-2 text-sm text-cyan-400 hover:text-cyan-300"
            >
                Download Voiceover
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceoverStudio;