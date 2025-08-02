import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  // UI State
  darkMode: false,
  sidebarOpen: false,
  
  // File Management
  files: [],
  uploadLoading: false,
  uploadProgress: 0,
  
  // Chat State  
  question: '',
  answer: '',
  context: '',
  queryLoading: false,
  conversationHistory: [],
  
  // User Session
  userId: null,
  sessionId: null,
  
  // Actions
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  // File Actions
  setFiles: (files) => set({ files }),
  addFiles: (newFiles) => set((state) => ({ 
    files: [...state.files, ...newFiles] 
  })),
  removeFile: (index) => set((state) => ({ 
    files: state.files.filter((_, i) => i !== index) 
  })),
  clearFiles: () => set({ files: [] }),
  setUploadLoading: (loading) => set({ uploadLoading: loading }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  
  // Chat Actions
  setQuestion: (question) => set({ question }),
  setAnswer: (answer) => set({ answer }),
  setContext: (context) => set({ context }),
  setQueryLoading: (loading) => set({ queryLoading: loading }),
  
  addToHistory: (userMessage, aiResponse) => set((state) => ({
    conversationHistory: [
      ...state.conversationHistory,
      {
        id: Date.now(),
        userMessage,
        aiResponse,
        timestamp: new Date().toISOString()
      }
    ]
  })),
  
  clearHistory: () => set({ conversationHistory: [] }),
  
  // Session Actions
  setUserId: (userId) => set({ userId }),
  setSessionId: (sessionId) => set({ sessionId }),
  
  // Reset Functions
  resetUpload: () => set({
    files: [],
    uploadLoading: false,
    uploadProgress: 0
  }),
  
  resetChat: () => set({
    question: '',
    answer: '',
    context: '',
    queryLoading: false
  }),
  
  resetAll: () => set({
    files: [],
    uploadLoading: false,
    uploadProgress: 0,
    question: '',
    answer: '',
    context: '',
    queryLoading: false,
    conversationHistory: [],
    userId: null,
    sessionId: null
  })
}));