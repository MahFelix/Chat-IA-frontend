export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  model: 'gemini-pro' | 'gemini-pro-vision';
  systemMessage?: string;
}