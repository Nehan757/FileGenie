import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import './App.css';
import FileGenieShowcase from './FileGenieShowcase';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://filegenie.onrender.com';

const axiosConfig = {
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
};

function App() {
    const [files, setFiles] = useState([]);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [context, setContext] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    // Check if device is mobile
useEffect(() => {
        const checkDevice = () => {
            // Check if device is mobile
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);

            if (mobile) {
                // Set zoom level to 80% for mobile
                document.body.style.zoom = "80%";
                document.body.style.transform = "scale(0.8)";
                document.body.style.transformOrigin = "top center";
                document.body.style.webkitTransform = "scale(0.8)";
                document.body.style.webkitTransformOrigin = "top center";
            } else {
                // Set zoom level to 90% for desktop
                document.body.style.zoom = "90%";
                document.body.style.transform = "scale(0.9)";
                document.body.style.transformOrigin = "top center";
                document.body.style.webkitTransform = "scale(0.9)";
                document.body.style.webkitTransformOrigin = "top center";
            }
        };

        // Initial check and setup
        checkDevice();

        // Add resize listener
        window.addEventListener('resize', checkDevice);

        // Cleanup
        return () => {
            window.removeEventListener('resize', checkDevice);
            // Reset zoom level on unmount
            document.body.style.zoom = "100%";
            document.body.style.transform = "none";
            document.body.style.webkitTransform = "none";
        };
    }, []);

    // Add meta viewport tag for better mobile handling
    useEffect(() => {
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
            viewport.content = 'width=device-width, initial-scale=0.8, maximum-scale=0.8, user-scalable=no';
        } else {
            const meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, initial-scale=0.8, maximum-scale=0.8, user-scalable=no';
            document.head.appendChild(meta);
        }

        return () => {
            if (viewport) {
                viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
            }
        };
    }, []);

    const particlesInit = useCallback(async engine => {
        await loadFull(engine);
    }, []);

    const particlesOptions = {
        background: {
            color: {
                value: "#f0f0f0",
            },
        },
        fpsLimit: 60,
        particles: {
            color: {
                value: "#3a86ff",
            },
            links: {
                color: "#3a86ff",
                distance: 150,
                enable: true,
                opacity: 0.5,
                width: 1,
            },
            move: {
                enable: true,
                speed: 1,  // Reduced speed for better performance
                direction: "none",
                random: false,
                straight: false,
                outMode: "bounce",
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                }
            },
            number: {
                density: {
                    enable: true,
                    area: 800,
                },
                value: 60,  // Reduced number of particles
            },
            opacity: {
                value: 0.5,
            },
            shape: {
                type: "circle",
            },
            size: {
                value: { min: 1, max: 3 },
            },
        },
        detectRetina: true,
        responsive: [
            {
                maxWidth: 768,
                options: {
                    particles: {
                        number: {
                            value: 0  // No particles on mobile
                        }
                    }
                }
            }
        ]
    };

    useEffect(() => {
        const cleanup = async () => {
            try {
                await axios.post(`${BACKEND_URL}/cleanup`, {}, axiosConfig);
            } catch (err) {
                console.error('Cleanup error:', err);
            }
        };

        return () => {
            cleanup();
        };
    }, []);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
        setError('');  // Clear any previous errors
    };

    const handleUpload = async () => {
        if (!files.length) return;

        setLoading(true);
        setError('');

        const formData = new FormData();
        files.forEach((file) => {
            if (file.type === 'application/pdf') {
                formData.append('files', file);
            }
        });

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
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.error || 'Error uploading files. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuery = async () => {
        if (!question.trim()) return;

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(
                `${BACKEND_URL}/query`,
                { question },
                axiosConfig
            );
            setAnswer(response.data.answer);
            setContext(response.data.context);
        } catch (err) {
            console.error('Query error:', err);
            setError(err.response?.data?.error || 'Error processing your question. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        setLoading(true);
        try {
            await axios.post(`${BACKEND_URL}/cleanup`, {}, axiosConfig);
            setFiles([]);
            setQuestion('');
            setAnswer('');
            setContext([]);
            setError('');
        } catch (err) {
            console.error('Reset error:', err);
            setError('Error resetting session. Please try again.');
        } finally {
            setLoading(false);
        }
    };

return (
        <div style={{
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f5f7fb',
            overflow: 'auto',
            padding: '20px'
        }}>
            {!isMobile && (
                <Particles
                    id="tsparticles"
                    init={particlesInit}
                    options={particlesOptions}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 0
                    }}
                />
            )}
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                zIndex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <FileGenieShowcase
                    onFileChange={handleFileChange}
                    onUpload={handleUpload}
                    onAsk={handleQuery}
                    question={question}
                    setQuestion={setQuestion}
                    loading={loading}
                    files={files}
                    answer={answer}
                    context={context}
                />
            </div>
        </div>
    );
};

export default App;

