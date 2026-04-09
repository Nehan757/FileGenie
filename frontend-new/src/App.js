import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './App.css';
import FileUpload from './components/FileUpload';
import ChatInterface from './components/ChatInterface';
import ThemeToggle from './components/ThemeToggle';
import Toast from './components/Toast';
import useThemeStore from './store/useThemeStore';
import { Sparkles, Trash2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

function App() {
    const [files, setFiles] = useState([]);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [context, setContext] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [toast, setToast] = useState(null);
    const [cleaning, setCleaning] = useState(false);

    const handleCleanup = async () => {
        setCleaning(true);
        try {
            const response = await fetch(`${BACKEND_URL}/cleanup`, {
                method: 'POST',
                credentials: 'include',
                headers: { ...(userId && { 'X-User-ID': userId }) }
            });
            const data = await response.json();
            setUserId(null);
            setFiles([]);
            setAnswer('');
            setContext([]);
            setToast({ type: 'success', message: 'Vector DB cleared successfully.' });
        } catch (err) {
            setToast({ type: 'error', message: 'Failed to clear Vector DB.' });
        } finally {
            setCleaning(false);
        }
    };

    const { initializeTheme } = useThemeStore();

    // Initialize theme on app start
    useEffect(() => {
        initializeTheme();
    }, [initializeTheme]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
    };

    const handleUpload = async () => {
        if (!files.length) return;

        setIsUploading(true);
        setLoading(true);

        const formData = new FormData();
        files.forEach((file) => {
            if (file.type === 'application/pdf') {
                formData.append('files', file);
            }
        });

        try {
            const response = await fetch(`${BACKEND_URL}/upload`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
                headers: {
                    ...(userId && { 'X-User-ID': userId })
                }
            });
            
            const data = await response.json();
            if (!response.ok) {
                setToast({ type: 'error', message: data.error || 'Upload failed. Please try again.' });
            } else {
                setToast({ type: 'success', message: `${data.files_processed?.length || 'Your'} file(s) processed successfully!` });
                if (data.user_id) setUserId(data.user_id);
            }
        } catch (err) {
            console.error('Upload error:', err);
            setToast({ type: 'error', message: 'Upload failed. Check your connection.' });
        } finally {
            setLoading(false);
        }
    };

    const handleQuery = async () => {
        if (!question.trim()) return;

        setIsUploading(false);
        setLoading(true);
        
        console.log('Making query with user_id:', userId);

        try {
            const response = await fetch(`${BACKEND_URL}/query`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(userId && { 'X-User-ID': userId })
                },
                body: JSON.stringify({ question })
            });
            
            const data = await response.json();
            setAnswer(data.answer);
            setContext(data.context);
        } catch (err) {
            console.error('Query error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 transition-all duration-500">
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
            {/* Animated Background Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl"
                />
                <motion.div
                    animate={{
                        rotate: -360,
                        scale: [1.2, 1, 1.2],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -bottom-10 -right-10 w-60 h-60 bg-purple-500/20 rounded-full blur-2xl"
                />
            </div>

            {/* Header */}
            <div className="relative z-10 flex justify-between items-center p-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-3"
                >
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white dark:text-white">
                        FileGenie
                    </h1>
                </motion.div>
                
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <ThemeToggle />
                </motion.div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 container mx-auto px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white dark:text-white mb-4">
                        RAG-Powered Document Intelligence
                    </h2>
                    <p className="text-xl text-white/90 dark:text-white/80 max-w-2xl mx-auto font-medium">
                        Advanced <span className="text-purple-200 dark:text-purple-300 font-bold">Retrieval-Augmented Generation (RAG)</span> technology 
                        for precise document analysis and intelligent Q&A.
                    </p>
                    
                    {/* RAG Architecture Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="mt-6 inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-purple-300/30 rounded-full px-4 py-2"
                    >
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white dark:text-white/90 text-sm font-bold">
                            Powered by RAG Architecture
                        </span>
                    </motion.div>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
                    {/* File Upload Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="flex-1"
                    >
                        <FileUpload
                            files={files}
                            onFileChange={handleFileChange}
                            onUpload={handleUpload}
                            loading={loading && isUploading}
                        />
                    </motion.div>

                    {/* Chat Interface Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="flex-1"
                    >
                        <ChatInterface
                            question={question}
                            setQuestion={setQuestion}
                            onAsk={handleQuery}
                            answer={answer}
                            loading={loading && !isUploading}
                        />
                    </motion.div>
                </div>

                {/* Features Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
                >
                    {[
                        {
                            title: "Document Ingestion",
                            description: "RAG pipeline processes and chunks your PDFs into searchable embeddings",
                            icon: "📄"
                        },
                        {
                            title: "Vector Retrieval",
                            description: "Semantic search finds relevant document sections for your queries",
                            icon: "🔍"
                        },
                        {
                            title: "Augmented Generation",
                            description: "AI generates precise answers using retrieved document context",
                            icon: "🧠"
                        }
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -5 }}
                            className="glass rounded-xl p-6 text-center"
                        >
                            <div className="text-3xl mb-3">{feature.icon}</div>
                            <h3 className="text-lg font-bold text-white dark:text-white mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-white/90 dark:text-white/70 text-sm font-medium">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Cleanup Button - bottom right */}
            <div className="fixed bottom-6 right-6 z-50 group">
                <button
                    onClick={handleCleanup}
                    disabled={cleaning}
                    className="w-12 h-12 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                    <Trash2 className={`w-5 h-5 ${cleaning ? 'animate-pulse' : ''}`} />
                </button>
                <span className="absolute bottom-14 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    Clear Vector DB
                </span>
            </div>
        </div>
    );
}

export default App;
