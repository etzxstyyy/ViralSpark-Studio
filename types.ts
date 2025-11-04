export interface Topic {
  title: string;
  hook: string;
  description: string;
  content_type: string;
  image_query: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  style: string;
  geminiVoice: string;
}
