import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import PS from './assets/person.png'
import RB from './assets/robot.png'

// Tipos
type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
};

type ChatMessageProps = {
  message: Message;
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const formatMessage = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```|`[^`]*`)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const languageMatch = part.match(/^```(\w+)/);
        const language = languageMatch ? languageMatch[1] : '';
        const code = part.replace(/^```[\w]*\n/, '').replace(/```$/, '');
        
        return (
          <pre key={index} className={`my-2 p-4 rounded-lg bg-gray-800 text-gray-100 overflow-x-auto ${
            message.role === 'assistant' ? 'border-l-4 border-blue-500' : ''
          }`}>
            {language && (
              <div className="text-xs text-gray-400 mb-2">
                {language.toUpperCase()}
              </div>
            )}
            <code className={`font-mono text-sm ${language ? `language-${language}` : ''}`}>
              {code}
            </code>
          </pre>
        );
      } else if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="bg-gray-200 px-1 py-0.5 rounded text-sm font-mono">
            {part.slice(1, -1)}
          </code>
        );
      } else {
        const formattedText = part
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/^# (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
          .replace(/^## (.*$)/gm, '<h4 className="font-bold mt-3 mb-1">$1</h4>')
          .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
          .replace(/\n/g, '<br />');
        
        return (
          <div key={index} className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formattedText }} />
        );
      }
    });
  };

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4 px-2`}>
      <div className={`flex items-start gap-2 max-w-full ${
        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
      }`}>
        {/* Container do Avatar - Ajustado para mobile */}
        <div className={`
          flex-shrink-0
          w-10 h-10    
          sm:w-12 sm:h-12 
          md:w-16 md:h-16 
          rounded-full 
          overflow-hidden
          ${message.role === 'user' ? 'bg-gray-500' : 'bg-gray-400'}
        `}>
          <img 
            src={message.role === 'user' ? PS : RB} 
            alt={message.role === 'user' ? 'User Avatar' : 'Assistant Avatar'} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Container da Mensagem */}
        <div className={`
          max-w-[calc(100%-60px)]  // Ajuste para deixar espaço para o avatar
          sm:max-w-[calc(100%-70px)]
          md:max-w-[80%] 
          rounded-lg px-4 py-2 
          ${message.role === 'user' 
            ? 'bg-blue-500 text-white rounded-br-none' 
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
          }
        `}>
          <div className="prose max-w-none">
            {formatMessage(message.content)}
          </div>
          <div className={`text-xs mt-1 ${
            message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export { ChatMessage };

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState<number | null>(null);

  // Verificar conexão com o backend ao carregar
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: 'ping' }),
        });
        
        if (!response.ok) {
          throw new Error('Backend not responding');
        }
      } catch (error) {
        console.error('Connection check failed:', error);
        setConnectionError(true);
        
        const errorMessage: Message = {
          role: 'system',
          content: 'Erro: Não foi possível conectar ao servidor. Verifique se o backend está rodando.',
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    };
    
    checkConnection();

    // Adicionando mensagem inicial do assistente
    const welcomeMessage: Message = {
      role: 'assistant',
      content: 'Olá, eu sou **Aether**, seu assistente técnico altamente especializado em desenvolvimento de software. Como posso te ajudar hoje?',
      timestamp: Date.now(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    if (lastRequestTime && Date.now() - lastRequestTime < 3000) {
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Por favor, espere alguns segundos entre as mensagens',
        timestamp: Date.now(),
      }]);
      return;
    }
  
    setLastRequestTime(Date.now());
  
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };
  
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setConnectionError(false);
  
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input,
          context: messages.map(msg => ({
            sender: msg.role,
            text: msg.content
          }))
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply,
        timestamp: Date.now(),
      };
  
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      
      const errorMessage: Message = {
        role: 'system',
        content: error instanceof Error ? error.message : 'Erro desconhecido ao processar sua mensagem',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      setConnectionError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col max-w-5xl mx-auto bg-white shadow-xl">
        <header className="p-4 border-b">
          <h1 className="text-xl font-semibold">Aether Chat</h1>
          {connectionError && (
            <p className="text-red-500 text-sm">Problema de conexão com o servidor</p>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage key={`${message.timestamp}-${index}`} message={message} />
          ))}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
        </main>

        <footer className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading || connectionError}
            />
            <button
              type="submit"
              disabled={loading || connectionError || !input.trim()}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}

export default App;
