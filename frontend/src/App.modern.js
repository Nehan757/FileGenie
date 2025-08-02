import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { motion } from 'framer-motion';
import Navigation from './components/Navigation';
import FileUpload from './components/FileUpload';
import ChatInterface from './components/ChatInterface';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Alert, AlertDescription } from './components/ui/alert';
import { useAppStore } from './store/useAppStore';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://filegenie.onrender.com';

const axiosConfig = {
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
};

function App() {
    const {
        files,
        setFiles,
        question,
        setQuestion,
        answer,
        setAnswer,
        context,
        setContext,
        uploadLoading,
        setUploadLoading,
        queryLoading,
        setQueryLoading,
        userId,
        setUserId,
        darkMode
    } = useAppStore();

    const [isMobile, setIsMobile] = useState(false);
    const [coldStartNotice, setColdStartNotice] = useState(false);

    // Check if device is mobile
    useEffect(() => {
        const checkDevice = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    // Initialize user session
    useEffect(() => {
        const initializeSession = async () => {
            try {
                let storedUserId = localStorage.getItem('filegenieUserId');
                
                if (!storedUserId) {
                    storedUserId = 'user_' + Math.random().toString(36).substr(2, 9);
                    localStorage.setItem('filegenieUserId', storedUserId);
                }
                
                setUserId(storedUserId);
                console.log('Session initialized with user_id:', storedUserId);
            } catch (err) {
                console.error('Session initialization error:', err);
            }
        };

        initializeSession();
    }, [setUserId]);

    const particlesInit = useCallback(async engine => {
        await loadFull(engine);
    }, []);

    const particlesOptions = {
        background: {
            color: {
                value: darkMode ? "#1a1a2e" : "#f8fafc",
            },
        },
        fpsLimit: 60,
        particles: {
            color: {
                value: darkMode ? "#a855f7" : "#6366f1",
            },
            links: {
                color: darkMode ? "#a855f7" : "#6366f1",
                distance: 150,
                enable: true,
                opacity: 0.3,
                width: 1,
            },
            collisions: {
                enable: true,
            },
            move: {
                direction: "none",
                enable: true,
                outModes: {
                    default: "bounce",
                },
                random: false,
                speed: 1,
                straight: false,
            },
            number: {
                density: {
                    enable: true,
                    area: 800,
                },
                value: 40,
            },
            opacity: {
                value: 0.3,
            },
            shape: {
                type: "circle",
            },
            size: {
                value: { min: 1, max: 3 },
            },
        },
        detectRetina: true,
    };

    const handleFileChange = (newFiles) => {
        if (Array.isArray(newFiles)) {
            setFiles(newFiles);
        } else {
            // Handle file input event
            const selectedFiles = Array.from(newFiles.target?.files || newFiles);
            setFiles(selectedFiles);
        }
    };

    const handleUpload = async () => {
        if (!files.length) return;

        setUploadLoading(true);
        setColdStartNotice(true);

        const formData = new FormData();
        files.forEach((file) => {
            if (file.type === 'application/pdf') {
                formData.append('files', file);
            }
        });

        formData.append('user_id', userId);

        try {
            const response = await axios.post(
                `${BACKEND_URL}/upload`,
                formData,
                {
                    ...axiosConfig,
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log('Upload successful:', response.data);
            
            // Auto-hide cold start notice after successful upload
            setTimeout(() => setColdStartNotice(false), 2000);
            
        } catch (err) {
            console.error('Upload error:', err);
        } finally {
            setUploadLoading(false);
        }
    };

    const handleQuery = async (e) => {
        e?.preventDefault();
        if (!question.trim()) return;

        setQueryLoading(true);
        
        if (!coldStartNotice) {
            setColdStartNotice(true);
        }

        try {
            const response = await axios.post(
                `${BACKEND_URL}/query`,
                {
                    question: question.trim(),
                    user_id: userId
                },
                axiosConfig
            );

            setAnswer(response.data.answer);
            setContext(response.data.context);
            
            // Auto-hide cold start notice after successful query
            setTimeout(() => setColdStartNotice(false), 2000);
            
        } catch (err) {
            console.error('Query error:', err);
            setAnswer('Sorry, I encountered an error while processing your question. Please try again.');
        } finally {
            setQueryLoading(false);
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
            {/* Particles Background */}
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={particlesOptions}
                className="absolute inset-0 z-0"
            />

            {/* Navigation */}
            <Navigation />

            {/* Main Content */}
            <div className="relative z-10 pt-20 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Cold Start Notice */}
                    {coldStartNotice && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6"
                        >
                            <Alert variant="info" className="bg-blue-50 border-blue-200">
                                <AlertDescription className="text-blue-800">
                                    <strong>🔄 First request after inactivity:</strong> Server is starting up (30-60s). 
                                    Subsequent requests will be instant!
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    )}

                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                            FileGenie
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            AI-powered document analysis with advanced RAG technology. 
                            Upload your PDFs and start asking intelligent questions.
                        </p>
                    </motion.div>

                    {/* Main Interface */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        
                        {/* File Upload Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            id="upload"
                        >
                            <Card variant="glass" className="h-full">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Upload Documents</CardTitle>
                                    <p className="text-gray-600">
                                        Upload your PDF documents to start analyzing them with AI
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <FileUpload
                                        files={files}
                                        onFileChange={handleFileChange}
                                        onUpload={handleUpload}
                                        loading={uploadLoading}
                                        disabled={uploadLoading || queryLoading}
                                    />
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Chat Interface Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            id="chat"
                        >
                            <ChatInterface
                                question={question}
                                setQuestion={setQuestion}
                                onSubmit={handleQuery}
                                answer={answer}
                                loading={queryLoading}
                                disabled={!userId || (!files.length && !answer)}
                                placeholder={files.length === 0 ? "Upload documents first to start asking questions..." : "Ask a question about your documents..."}
                            />
                        </motion.div>
                    </div>

                    {/* Features Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        id="about"
                        className="text-center"
                    >
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">
                            Powered by Advanced AI Technology
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card variant="glass">
                                <CardContent className="p-6 text-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">🧠</span>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Smart Analysis</h3>
                                    <p className="text-gray-600">
                                        Advanced RAG technology for intelligent document understanding
                                    </p>
                                </CardContent>
                            </Card>
                            
                            <Card variant="glass">
                                <CardContent className="p-6 text-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">⚡</span>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Fast Processing</h3>
                                    <p className="text-gray-600">
                                        Quick document processing and instant query responses
                                    </p>
                                </CardContent>
                            </Card>
                            
                            <Card variant="glass">
                                <CardContent className="p-6 text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">🔒</span>
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
                                    <p className="text-gray-600">
                                        Your documents are processed securely and never stored permanently
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default App;