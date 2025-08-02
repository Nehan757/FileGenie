import React from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, Bot, User } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import Input from './Input';

const ChatInterface = ({ 
  question, 
  setQuestion, 
  onAsk, 
  answer, 
  loading 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim() && !loading) {
      onAsk();
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center justify-center space-x-2">
          <MessageCircle className="w-6 h-6 text-purple-500" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Ask Questions
          </h3>
        </div>

        {/* Chat Messages */}
        <div className="space-y-4 min-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar">
          {answer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* User Question */}
              <div className="flex justify-end">
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <div className="bg-purple-500 rounded-lg p-3 shadow-md">
                    <p className="text-white text-sm">{question}</p>
                  </div>
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              
              {/* AI Answer */}
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white/30 dark:bg-gray-800/50 rounded-lg p-4 shadow-md border border-white/20">
                    <p className="text-gray-900 dark:text-white text-sm leading-relaxed font-medium">
                      {answer}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {!answer && (
            <div className="flex items-center justify-center h-32 text-gray-800 dark:text-gray-400">
              <div className="text-center space-y-2">
                <Bot className="w-12 h-12 mx-auto text-gray-700 dark:text-gray-500" />
                <p className="text-sm font-medium">Upload documents and ask questions to get started</p>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about your documents..."
                disabled={loading}
                className="text-base"
              />
            </div>
            <Button
              type="submit"
              disabled={!question.trim() || loading}
              loading={loading}
              size="lg"
              className="px-6"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Ask
                </>
              )}
            </Button>
          </div>
          
          <div className="text-xs text-gray-700 dark:text-gray-400 text-center font-medium">
            Press Enter to send • <span className="text-purple-600 dark:text-purple-400 font-bold">RAG-powered</span> responses from your documents
          </div>
        </form>
      </div>
    </Card>
  );
};

export default ChatInterface;