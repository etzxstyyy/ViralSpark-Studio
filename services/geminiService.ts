import { GoogleGenAI, Type, Modality, LiveServerMessage, Blob } from '@google/genai';
import { Topic } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const topicSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Short, catchy title (under 10 words).' },
      hook: { type: Type.STRING, description: 'A strong opening sentence to grab curiosity.' },
      description: { type: Type.STRING, description: 'A brief 1-sentence summary.' },
      content_type: { type: Type.STRING, description: 'Category of the content.' },
      image_query: { type: Type.STRING, description: 'Short phrase for fetching a related thumbnail image.' },
    },
    required: ['title', 'hook', 'description', 'content_type', 'image_query'],
  },
};

export async function generateTopics(): Promise<Topic[]> {
  const prompt = `
You are ViralHook AI — an intelligent viral content generator for YouTube Shorts.
Generate 20 highly engaging short-form content ideas. Each idea should include:
- title: short and catchy (under 10 words)
- hook: a strong opening that instantly grabs curiosity
- description: a brief 1-sentence summary
- content_type: choose from ['Real Story', 'Mind-Blowing Fact', 'Psychological Twist', 'Unbelievable Science', 'Historical Mystery', 'Mysterious Discovery', 'Random Viral Mix', 'Technology Insight', 'Life Hack / Hidden Truth', 'Cosmic / Space Fact']
- image_query: short phrase for fetching a related Unsplash thumbnail image (e.g. 'stardust galaxy', 'ancient ruins', 'human brain neurons')
Avoid politics, NSFW, or misinformation.
Return exactly 20 JSON objects.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: topicSchema,
      },
    });
    
    const jsonString = response.text.trim();
    const topics = JSON.parse(jsonString);
    return topics as Topic[];
  } catch(error) {
    console.error("Error generating topics:", error);
    throw new Error("Failed to parse topics from Gemini response.");
  }
}

export async function generateScriptForTopic(topic: Topic, duration: string): Promise<string> {
  const prompt = `
  You are ViralSpark AI, a scriptwriter for viral YouTube Shorts. Write a script for a video about the following topic: "${topic.title}".

  The script should be perfectly timed for a video with a target duration of ${duration}.
  Base the script on this initial hook and description:
  - Hook: "${topic.hook}"
  - Description: "${topic.description}"

  Your script should:
  - Have a fast, attention-grabbing pace suitable for short-form content.
  - Include a strong hook, an interesting middle section, and a short, impactful conclusion.
  - Be concise and captivating.

  IMPORTANT: Your output must be ONLY the script text, ready for a text-to-speech engine. Do not include any titles, labels (like "SCRIPT:"), or extra formatting.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
        thinkingConfig: { thinkingBudget: 32768 },
    }
  });
  
  return response.text.trim();
}


export async function generateVoiceover(script: string, voiceName: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: script }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data received from API.");
    }
    return base64Audio;
}

// FIX: Implement startTranscriptionSession and helper functions for audio processing.
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    // The supported audio MIME type is 'audio/pcm'. Do not use other types.
    mimeType: 'audio/pcm;rate=16000',
  };
}

export async function startTranscriptionSession(
  onUpdate: (text: string, isFinal: boolean) => void,
  onError: (error: Error) => void,
) {
  const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  
  let stream: MediaStream | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let scriptProcessor: ScriptProcessorNode | null = null;
  
  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onopen: async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          source = inputAudioContext.createMediaStreamSource(stream);
          scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromise.then((session) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioContext.destination);
        } catch (err) {
            if (err instanceof Error) {
                onError(err);
            } else {
                onError(new Error('Failed to get user media.'));
            }
        }
      },
      onmessage: (message: LiveServerMessage) => {
        const transcription = message.serverContent?.inputTranscription;
        const isFinal = !!message.serverContent?.turnComplete;
        
        if (transcription) {
            onUpdate(transcription.text, isFinal);
        } else if (isFinal) {
            // A turn can complete without a final transcription packet
            onUpdate('', true);
        }
      },
      onerror: (e: ErrorEvent) => {
        onError(e.error || new Error('An unknown error occurred during transcription.'));
      },
      onclose: (e: CloseEvent) => {
        console.debug('Transcription session closed.');
      },
    },
    config: {
      responseModalities: [Modality.AUDIO],
      inputAudioTranscription: {},
    },
  });

  const session = await sessionPromise;

  const close = () => {
    if (scriptProcessor) {
      scriptProcessor.disconnect();
      scriptProcessor.onaudioprocess = null;
      scriptProcessor = null;
    }
    if (source) {
      source.disconnect();
      source = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    if (inputAudioContext.state !== 'closed') {
      inputAudioContext.close();
    }
    session.close();
  };

  return {
    close,
  };
}
