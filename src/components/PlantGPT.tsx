import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import TopBar from './TopBar';
import { usePlant } from '../context/PlantContext';

const PlantGPTContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #16213e 100%);
  color: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px); /* Subtract TopBar height */
  overflow: hidden;
`;


const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #1e293b;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #34d399;
    border-radius: 4px;
  }
`;

const Message = styled.div<{ isUser: boolean }>`
  display: flex;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  margin-bottom: 16px;
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 70%;
  padding: 16px 20px;
  border-radius: 20px;
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
    : 'linear-gradient(135deg, #374151 0%, #4b5563 100%)'
  };
  color: ${props => props.isUser ? '#000000' : '#ffffff'};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    ${props => props.isUser ? 'right: -8px' : 'left: -8px'};
    top: 20px;
    width: 0;
    height: 0;
    border: 8px solid transparent;
    border-${props => props.isUser ? 'left' : 'right'}-color: ${props => props.isUser ? '#34d399' : '#374151'};
  }
`;

const MessageText = styled.div`
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const MessageMeta = styled.div<{ isUser: boolean }>`
  font-size: 0.8rem;
  color: ${props => props.isUser ? '#065f46' : '#9ca3af'};
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Sources = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #4b5563;
`;

const SourceTag = styled.span`
  display: inline-block;
  background: #1f2937;
  color: #34d399;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-right: 8px;
  margin-bottom: 4px;
`;

const InputArea = styled.div`
  padding: 20px;
  background: #1e293b;
  border-top: 1px solid #374151;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
`;

const TextInput = styled.textarea`
  flex: 1;
  background: #374151;
  border: 2px solid #4b5563;
  border-radius: 12px;
  padding: 12px 16px;
  color: #ffffff;
  font-size: 1rem;
  resize: none;
  min-height: 50px;
  max-height: 120px;
  
  &:focus {
    outline: none;
    border-color: #34d399;
    box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const SendButton = styled.button<{ disabled: boolean }>`
  background: ${props => props.disabled 
    ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
    : 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
  };
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  color: ${props => props.disabled ? '#9ca3af' : '#000000'};
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  min-width: 80px;
  
  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 6px 20px rgba(52, 211, 153, 0.4)'};
  }
`;

const SuggestionsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

const SuggestionChip = styled.button`
  background: #374151;
  border: 1px solid #4b5563;
  border-radius: 20px;
  padding: 8px 16px;
  color: #34d399;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #4b5563;
    border-color: #34d399;
    transform: translateY(-1px);
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #34d399;
  font-style: italic;
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 4px;
  
  & > div {
    width: 6px;
    height: 6px;
    background: #34d399;
    border-radius: 50%;
    animation: loading 1.4s infinite ease-in-out both;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
  
  @keyframes loading {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`;

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
  confidence?: number;
}

interface PlantGPTResponse {
  response: string;
  conversation_id: string;
  sources: string[];
  confidence: number;
  suggestions: string[];
}

type PageType = 'main' | 'plantgpt' | 'dashboard' | 'cvanalysis';

interface PlantGPTProps {
  onNavigate?: (page: PageType) => void;
  currentTime?: Date;
  currentTemp?: number;
}

const PlantGPT: React.FC<PlantGPTProps> = ({ onNavigate, currentTime = new Date(), currentTemp = 21 }) => {
  const { currentPlantData } = usePlant();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_BASE_URL = 'http://localhost:8000/api/v1';

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome to PlantGPT! 🏭

I'm your AI assistant for cement plant operations at ${currentPlantData.name} - ${currentPlantData.location}. I can help you with:

• Process optimization strategies
• Quality control guidance  
• Energy efficiency improvements
• Maintenance planning
• Safety and compliance advice
• Alternate fuel utilization
• Troubleshooting assistance

Current Plant Status:
• Clinker Production: ${currentPlantData.current_production.clinker} ton/day
• Cement Production: ${currentPlantData.current_production.cement} ton/day
• Plant Utilization: ${currentPlantData.current_production.utilization}%
• Overall Performance: ${currentPlantData.performance_summary.overall_score}/100

Ask me anything about cement plant operations!`,
      timestamp: new Date(),
      sources: [],
      confidence: 1.0
    };
    
    setMessages([welcomeMessage]);
    
    // Set initial suggestions
    setSuggestions([
      "How can I optimize kiln temperature profile?",
      "What affects cement grinding efficiency?",
      "How to improve alternate fuel utilization?",
      "Best practices for quality control?",
      "How to reduce specific power consumption?"
    ]);
  }, [
    currentPlantData.name,
    currentPlantData.location,
    currentPlantData.current_production.clinker,
    currentPlantData.current_production.cement,
    currentPlantData.current_production.utilization,
    currentPlantData.performance_summary.overall_score
  ]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await axios.post<PlantGPTResponse>(`${API_BASE_URL}/plantgpt/chat`, {
        message: messageText,
        conversation_id: conversationId,
        use_rag: true,
        plant: currentPlantData.id
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
        sources: response.data.sources,
        confidence: response.data.confidence
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationId(response.data.conversation_id);
      setSuggestions(response.data.suggestions);

    } catch (error) {
      console.error('PlantGPT API Error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m experiencing technical difficulties. Please ensure the backend server is running and try again.',
        timestamp: new Date(),
        sources: [],
        confidence: 0
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <PlantGPTContainer>
      <TopBar 
        currentTime={currentTime}
        currentTemp={currentTemp}
        currentPage="plantgpt"
        onPageChange={onNavigate}
      />
      
      <ContentContainer>
        <ChatContainer>
        <MessagesArea>
          {messages.map((message) => (
            <Message key={message.id} isUser={message.role === 'user'}>
              <MessageBubble isUser={message.role === 'user'}>
                <MessageText>{message.content}</MessageText>
                
                {message.sources && message.sources.length > 0 && (
                  <Sources>
                    <div style={{ fontSize: '0.8rem', marginBottom: '8px', color: '#9ca3af' }}>
                      Sources:
                    </div>
                    {message.sources.map((source, index) => (
                      <SourceTag key={index}>{source}</SourceTag>
                    ))}
                  </Sources>
                )}
                
                <MessageMeta isUser={message.role === 'user'}>
                  <span>{formatTimestamp(message.timestamp)}</span>
                  {message.confidence !== undefined && (
                    <span>Confidence: {Math.round(message.confidence * 100)}%</span>
                  )}
                </MessageMeta>
              </MessageBubble>
            </Message>
          ))}
          
          {isLoading && (
            <Message isUser={false}>
              <MessageBubble isUser={false}>
                <LoadingIndicator>
                  <span>PlantGPT is thinking</span>
                  <LoadingDots>
                    <div></div>
                    <div></div>
                    <div></div>
                  </LoadingDots>
                </LoadingIndicator>
              </MessageBubble>
            </Message>
          )}
          
          <div ref={messagesEndRef} />
        </MessagesArea>
        
        <InputArea>
          {suggestions.length > 0 && (
            <SuggestionsContainer>
              {suggestions.map((suggestion, index) => (
                <SuggestionChip
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </SuggestionChip>
              ))}
            </SuggestionsContainer>
          )}
          
          <InputContainer>
            <TextInput
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about cement plant operations..."
              disabled={isLoading}
            />
            <SendButton
              onClick={() => sendMessage(inputText)}
              disabled={isLoading || !inputText.trim()}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </SendButton>
          </InputContainer>
        </InputArea>
      </ChatContainer>
      </ContentContainer>
    </PlantGPTContainer>
  );
};

export default PlantGPT;
