/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Message } from '../types/chat';
import { Bot, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  // Verifica se é uma mensagem de erro sobre geração de imagens
  const isImageGenerationError = message.content.includes("não consigo gerar imagens diretamente");

  return (
    <div className={cn(
      "flex gap-3 p-4",
      message.role === 'assistant' ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'
    )}>
      <div className={cn(
        "w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full",
        message.role === 'assistant' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-200 dark:bg-gray-600'
      )}>
        {message.role === 'assistant' ? (
          <Bot size={20} className="text-blue-600 dark:text-blue-300" />
        ) : (
          <User size={20} className="text-gray-700 dark:text-gray-300" />
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {isImageGenerationError ? (
          <div className="text-red-500 dark:text-red-400">
            <p>Para gerar imagens, use o comando especial:</p>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded my-2">
              <code>imagem: sua descrição aqui</code>
            </div>
            <p>Exemplo: <code>imagem: um gato siamês em um sofá vermelho</code></p>
          </div>
        ) : (
          <ReactMarkdown
            className="prose max-w-none dark:prose-invert prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-li:my-1"
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    showLineNumbers
                    wrapLines
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={cn(
                    "bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm",
                    className
                  )} {...props}>
                    {children}
                  </code>
                );
              },
              img({ src, alt, ...props }) {
                return (
                  <div className="my-3">
                    <img 
                      src={src} 
                      alt={alt || 'Generated image'} 
                      className="rounded-lg max-w-full h-auto border border-gray-200 dark:border-gray-700" 
                      {...props}
                    />
                    {alt && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                        {alt}
                      </p>
                    )}
                  </div>
                );
              },
              table({ children, ...props }) {
                return (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children, ...props }) {
                return (
                  <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left bg-gray-100 dark:bg-gray-700">
                    {children}
                  </th>
                );
              },
              td({ children, ...props }) {
                return (
                  <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">
                    {children}
                  </td>
                );
              },
              blockquote({ children, ...props }) {
                return (
                  <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-300">
                    {children}
                  </blockquote>
                );
              },
              a({ children, href, ...props }) {
                return (
                  <a 
                    href={href} 
                    className="text-blue-600 dark:text-blue-400 hover:underline" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    {...props}
                  >
                    {children}
                  </a>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};