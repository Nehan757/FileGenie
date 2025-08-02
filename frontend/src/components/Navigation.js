import React from 'react';
import { motion } from 'framer-motion';
import { FileText, MessageCircle, Moon, Sun, Menu, Github, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';

const Navigation = () => {
  const { darkMode, toggleDarkMode, sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                FileGenie
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">AI Document Q&A</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <a 
              href="#upload" 
              className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium"
            >
              Upload
            </a>
            <a 
              href="#chat" 
              className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium"
            >
              Chat
            </a>
            <a 
              href="#about" 
              className="text-gray-600 hover:text-purple-600 transition-colors text-sm font-medium"
            >
              About
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* GitHub Link */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('https://github.com/nehan-taruwar/filegenie', '_blank')}
              className="hidden sm:flex"
            >
              <Github className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">View Code</span>
              <ExternalLink className="w-3 h-3 ml-1 lg:hidden" />
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="p-2"
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="md:hidden p-2"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          className="md:hidden fixed inset-y-0 right-0 w-64 bg-white shadow-xl z-50"
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button variant="ghost" size="sm" onClick={toggleSidebar}>
                <Menu className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <a 
                href="#upload" 
                className="block py-2 text-gray-600 hover:text-purple-600 transition-colors"
                onClick={toggleSidebar}
              >
                Upload Documents
              </a>
              <a 
                href="#chat" 
                className="block py-2 text-gray-600 hover:text-purple-600 transition-colors"
                onClick={toggleSidebar}
              >
                Chat Interface
              </a>
              <a 
                href="#about" 
                className="block py-2 text-gray-600 hover:text-purple-600 transition-colors"
                onClick={toggleSidebar}
              >
                About FileGenie
              </a>
              <hr className="my-4" />
              <a 
                href="https://github.com/nehan-taruwar/filegenie" 
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2 text-gray-600 hover:text-purple-600 transition-colors"
                onClick={toggleSidebar}
              >
                <Github className="w-4 h-4 inline mr-2" />
                View on GitHub
              </a>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </motion.nav>
  );
};

export default Navigation;