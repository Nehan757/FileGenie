import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Copy, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { LoadingDots } from './ui/loading';
import { cn } from '../lib/utils';

const MessageBubble = ({ message, isUser, timestamp, isLoading = false }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn(
        "max-w-[80%] space-y-2",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Message Bubble */}
        <div className={cn(
          "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
          isUser 
            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-md" 
            : "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
        )}>
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
              <LoadingDots />
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{message}</div>
          )}
        </div>

        {/* Message Actions */}
        {!isUser && !isLoading && message && (
          <div className="flex items-center space-x-2 px-2">
            <button
              onClick={() => copyToClipboard(message)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Copy message"
            >
              <Copy className="w-3 h-3 text-gray-400 hover:text-gray-600" />
            </button>
            
            <button
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Good response"
            >
              <ThumbsUp className="w-3 h-3 text-gray-400 hover:text-green-500" />
            </button>
            
            <button
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Poor response"
            >
              <ThumbsDown className="w-3 h-3 text-gray-400 hover:text-red-500" />
            </button>

            {copied && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-xs text-green-600 font-medium"
              >
                Copied!
              </motion.span>
            )}
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <div className={cn(
            "text-xs text-gray-500 px-2",
            isUser ? "text-right" : "text-left"
          )}>
            {timestamp}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="flex justify-start mb-4"
  >
    <div className="max-w-[80%]">
      <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-xs text-gray-500">AI is thinking...</span>
        </div>
      </div>
    </div>
  </motion.div>
);

const ChatInterface = ({ 
  question, 
  setQuestion, 
  onSubmit, 
  answer, 
  loading = false, 
  disabled = false,
  placeholder = "Ask a question about your documents..."
}) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Update messages when answer changes
  useEffect(() => {
    if (answer && !loading) {
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        
        if (lastMessage && lastMessage.isLoading) {
          // Replace loading message with actual answer
          newMessages[newMessages.length - 1] = {
            id: Date.now(),
            message: answer,
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isLoading: false
          };
        } else {
          // Add new answer message
          newMessages.push({
            id: Date.now(),
            message: answer,
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isLoading: false
          });
        }
        
        return newMessages;
      });
    }
  }, [answer, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || disabled || loading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      message: question,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Add loading message
    const loadingMessage = {
      id: Date.now() + 1,
      message: '',
      isUser: false,
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    onSubmit(e);
  };

  const suggestedQuestions = [
    "What is the main topic of this document?",
    "Can you summarize the key points?",
    "What are the important findings?",
    "Tell me about the methodology used"
  ];

  return (
    <Card variant="glass" className="w-full h-[600px] flex flex-col">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
          <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>AI Assistant</span>
          </h3>
          <p className="text-sm text-gray-600">Ask questions about your uploaded documents</p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-gray-900">Ready to Answer</h4>
                <p className="text-gray-600 max-w-md">
                  Upload your documents and start asking questions. I'll help you understand and analyze your content.
                </p>
              </div>

              {/* Suggested Questions */}
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Try asking:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedQuestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setQuestion(suggestion)}
                      disabled={disabled}
                      className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message.message}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                  isLoading={message.isLoading}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={placeholder}
              disabled={disabled || loading}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!question.trim() || disabled || loading}
              loading={loading}
              size="default"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface;