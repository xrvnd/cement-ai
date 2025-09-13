import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useGemini } from '../context/GeminiContext';

const ChatbotContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: ${props => props.isOpen ? '400px' : '60px'};
  height: ${props => props.isOpen ? '500px' : '60px'};
  background: linear-gradient(135deg, rgba(15, 20, 40, 0.98) 0%, rgba(44, 62, 80, 0.98) 100%);
  border: 2px solid rgba(116, 185, 255, 0.4);
  border-radius: ${props => props.isOpen ? '16px' : '50%'};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(15px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  overflow: hidden;
  cursor: ${props => props.isOpen ? 'default' : 'pointer'};

  &:hover {
    ${props => !props.isOpen && `
      transform: scale(1.05);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
      border-color: rgba(116, 185, 255, 0.6);
    `}
  }
`;

const ChatbotToggle = styled.button<{ isOpen: boolean }>`
  position: absolute;
  top: ${props => props.isOpen ? '15px' : '50%'};
  right: ${props => props.isOpen ? '15px' : '50%'};
  transform: ${props => props.isOpen ? 'none' : 'translate(50%, -50%)'};
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1001;

  &:hover {
    background: linear-gradient(135deg, #0984e3 0%, #74b9ff 100%);
    transform: ${props => props.isOpen ? 'none' : 'translate(50%, -50%) scale(1.1)'};
  }
`;

const MinimizeButton = styled.button`
  position: absolute;
  top: 15px;
  right: 60px;
  width: 30px;
  height: 30px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(116, 185, 255, 0.3);
  border-radius: 50%;
  color: #74b9ff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(116, 185, 255, 0.2);
    transform: scale(1.1);
  }
`;

const ChatbotHeader = styled.div`
  padding: 20px 20px 15px 20px;
  border-bottom: 1px solid rgba(116, 185, 255, 0.3);
  background: linear-gradient(90deg, rgba(116, 185, 255, 0.1) 0%, rgba(116, 185, 255, 0.05) 100%);
`;

const ChatbotTitle = styled.h3`
  color: #74b9ff;
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChatbotSubtitle = styled.p`
  color: #8b9dc3;
  margin: 5px 0 0 0;
  font-size: 12px;
  opacity: 0.8;
`;

const ChatMessages = styled.div`
  height: 320px;
  overflow-y: auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(116, 185, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(116, 185, 255, 0.4);
    border-radius: 3px;
  }
`;

const Message = styled.div<{ isUser: boolean }>`
  display: flex;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  margin-bottom: 8px;
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 280px;
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' 
    : 'rgba(116, 185, 255, 0.1)'
  };
  color: ${props => props.isUser ? 'white' : '#e8eaf6'};
  border: ${props => props.isUser ? 'none' : '1px solid rgba(116, 185, 255, 0.3)'};
  
  ${props => props.isUser 
    ? 'border-bottom-right-radius: 6px;' 
    : 'border-bottom-left-radius: 6px;'
  }
`;

const InputContainer = styled.div`
  padding: 15px 20px;
  border-top: 1px solid rgba(116, 185, 255, 0.3);
  background: rgba(15, 20, 40, 0.8);
`;

const InputForm = styled.form`
  display: flex;
  gap: 10px;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(116, 185, 255, 0.3);
  border-radius: 20px;
  color: #ffffff;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #74b9ff;
    box-shadow: 0 0 0 2px rgba(116, 185, 255, 0.2);
  }

  &::placeholder {
    color: #8b9dc3;
    opacity: 0.7;
  }
`;

const SendButton = styled.button<{ disabled?: boolean }>`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #0984e3 0%, #74b9ff 100%);
    transform: scale(1.05);
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8b9dc3;
  font-size: 12px;
  font-style: italic;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(116, 185, 255, 0.3);
  border-radius: 50%;
  border-top-color: #74b9ff;
  animation: spin 1s ease-in-out infinite;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const QuickActions = styled.div`
  padding: 0 20px 15px 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const QuickActionButton = styled.button`
  padding: 6px 12px;
  background: rgba(116, 185, 255, 0.1);
  border: 1px solid rgba(116, 185, 255, 0.3);
  border-radius: 12px;
  color: #74b9ff;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(116, 185, 255, 0.2);
    border-color: rgba(116, 185, 255, 0.5);
    transform: translateY(-1px);
  }
`;

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hello! I'm your JK Cement Plant AI Assistant. I can help with text queries, analyze images, and process documents for plant operations, maintenance, and optimization. How can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { callGeminiAPI } = useGemini();

  const quickActions = [
    "Plant overview",
    "Kiln operations",
    "Mill performance",
    "Maintenance tips",
    "Safety protocols",
    "Quality control",
    "Energy efficiency",
    "Environmental compliance"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const analyzeFile = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: `Analyzing file: ${selectedFile.name}`,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      let prompt = `Analyze this ${selectedFile.type} file named "${selectedFile.name}" in the context of JK Cement plant operations. `;
      
      if (selectedFile.type.startsWith('image/')) {
        prompt += `This appears to be an image. Please analyze it and provide insights relevant to cement plant operations, safety, maintenance, or process optimization.`;
      } else if (selectedFile.type.includes('pdf') || selectedFile.type.includes('document')) {
        prompt += `This appears to be a document. Please analyze its content and provide insights relevant to cement plant operations, safety, maintenance, or process optimization.`;
      } else {
        prompt += `Please analyze this file and provide insights relevant to cement plant operations.`;
      }
      
      const response = await callGeminiAPI(prompt);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      removeFile();
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm experiencing technical difficulties analyzing the file. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add keyboard shortcut to close chatbot
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Create a context-aware prompt for JK Cement
      const enhancedPrompt = `You are an expert AI assistant for JK Cement India plants. A user has asked: "${inputValue.trim()}"

Please provide a comprehensive, helpful response that includes:

1. **JK Cement Specific Information**: Include relevant details about JK Cement's operations, standards, and best practices
2. **Technical Accuracy**: Provide accurate cement plant engineering information
3. **Practical Guidance**: Offer actionable advice and recommendations
4. **Safety Focus**: Emphasize safety protocols and best practices
5. **Environmental Awareness**: Include sustainability and compliance considerations

Context: This is for JK Cement plant operators, engineers, and managers who need reliable, practical information for daily operations.

Please format your response clearly with bullet points, sections, and specific actionable items when appropriate.`;

      const response = await callGeminiAPI(enhancedPrompt);
      const aiResponseText = response;
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment or contact your system administrator.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    // Auto-submit quick actions
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: action,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Create specific prompts for quick actions
    const quickActionPrompts: Record<string, string> = {
      "Plant overview": "Provide a comprehensive overview of JK Cement plant operations, including key processes, equipment, and operational highlights.",
      "Kiln operations": "Explain JK Cement kiln operations, best practices, temperature control, and optimization strategies.",
      "Mill performance": "Detail cement mill performance optimization, grinding efficiency, and quality control measures for JK Cement.",
      "Maintenance tips": "Share preventive maintenance strategies and best practices for JK Cement plant equipment.",
      "Safety protocols": "Outline safety protocols and procedures specific to JK Cement plant operations.",
      "Quality control": "Explain quality control processes and standards used in JK Cement production.",
      "Energy efficiency": "Provide energy efficiency strategies and optimization techniques for JK Cement plants.",
      "Environmental compliance": "Detail environmental compliance measures and sustainability practices at JK Cement plants."
    };

    const prompt = quickActionPrompts[action] || action;
    
    callGeminiAPI(prompt).then((response) => {
      const aiResponseText = response;
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }).catch(() => {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    });
  };

  return (
    <ChatbotContainer isOpen={isOpen}>
      <ChatbotToggle 
        isOpen={isOpen} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
      >
        {isOpen ? '✕' : '💬'}
      </ChatbotToggle>

      {/* Make the entire collapsed chatbot clickable */}
      {!isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            cursor: 'pointer',
            zIndex: 999
          }}
          onClick={() => setIsOpen(true)}
          title="Click to open AI Assistant"
        >
          {/* Hover tooltip */}
          <div style={{
            position: 'absolute',
            top: '-40px',
            right: '0px',
            background: 'rgba(15, 20, 40, 0.95)',
            color: '#74b9ff',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 'bold',
            border: '1px solid rgba(116, 185, 255, 0.4)',
            whiteSpace: 'nowrap',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            transform: 'translateX(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateX(0px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0';
            e.currentTarget.style.transform = 'translateX(10px)';
          }}
          >
            💬 Click to open AI Assistant
          </div>
        </div>
      )}

      {isOpen && (
        <>
          <MinimizeButton onClick={() => setIsOpen(false)} title="Minimize">
            −
          </MinimizeButton>

          <ChatbotHeader>
            <ChatbotTitle>
              🤖 JK Cement AI Assistant
            </ChatbotTitle>
            <ChatbotSubtitle>
              Your intelligent plant operations companion
              <span style={{ 
                marginLeft: '8px', 
                fontSize: '10px', 
                opacity: 0.7,
                background: 'rgba(116, 185, 255, 0.1)',
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid rgba(116, 185, 255, 0.3)'
              }}>
                ESC to close
              </span>
            </ChatbotSubtitle>
          </ChatbotHeader>

          <QuickActions style={{ padding: '0 20px' }}>
            {quickActions.map((action) => (
              <QuickActionButton
                key={action}
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
              >
                {action}
              </QuickActionButton>
            ))}
          </QuickActions>

          {/* File Upload Section */}
          <div style={{ marginBottom: '15px', padding: '0 20px' }}>
            <div style={{ 
              color: '#8b9dc3', 
              fontSize: '12px', 
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>
              📎 Upload & Analyze Files
            </div>
            
            {!selectedFile ? (
              <div style={{
                border: '2px dashed rgba(116, 185, 255, 0.3)',
                borderRadius: '8px',
                padding: '15px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => fileInputRef.current?.click()}
              >
                <div style={{ color: '#74b9ff', fontSize: '16px', marginBottom: '5px' }}>
                  📁 Click to Upload
                </div>
                <div style={{ color: '#8b9dc3', fontSize: '11px' }}>
                  Images, PDFs, Documents
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div style={{
                background: 'rgba(116, 185, 255, 0.1)',
                border: '1px solid rgba(116, 185, 255, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {filePreview && (
                    <img 
                      src={filePreview} 
                      alt="Preview" 
                      style={{ 
                        width: '30px', 
                        height: '30px', 
                        borderRadius: '4px',
                        objectFit: 'cover'
                      }} 
                    />
                  )}
                  <div>
                    <div style={{ color: '#74b9ff', fontSize: '12px', fontWeight: 'bold' }}>
                      {selectedFile.name}
                    </div>
                    <div style={{ color: '#8b9dc3', fontSize: '10px' }}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onClick={analyzeFile}
                    disabled={isLoading}
                    style={{
                      background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 10px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {isLoading ? '🔄' : '🔍'}
                  </button>
                  <button
                    onClick={removeFile}
                    style={{
                      background: 'rgba(231, 76, 60, 0.8)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 8px',
                      fontSize: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    ✖
                  </button>
                </div>
              </div>
            )}
          </div>

          <ChatMessages style={{ padding: '0 20px' }}>
            {messages.map((message) => (
              <Message key={message.id} isUser={message.isUser}>
                <MessageBubble isUser={message.isUser}>
                  {message.text}
                </MessageBubble>
              </Message>
            ))}
            
            {isLoading && (
              <Message isUser={false}>
                <MessageBubble isUser={false}>
                  <LoadingIndicator>
                    <Spinner />
                    Analyzing your request...
                  </LoadingIndicator>
                </MessageBubble>
              </Message>
            )}
            
            <div ref={messagesEndRef} />
          </ChatMessages>

          <InputContainer style={{ padding: '0 20px' }}>
            <InputForm onSubmit={handleSubmit}>
              <ChatInput
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about JK Cement plant operations..."
                disabled={isLoading}
              />
              <SendButton type="submit" disabled={isLoading || !inputValue.trim()}>
                ➤
              </SendButton>
            </InputForm>
          </InputContainer>
        </>
      )}
    </ChatbotContainer>
  );
};

export default Chatbot;
