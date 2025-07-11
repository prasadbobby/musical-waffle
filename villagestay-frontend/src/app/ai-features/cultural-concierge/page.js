'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  MicrophoneIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import Providers from '@/components/providers/Providers';
import AppLayout from '@/components/layout/AppLayout';
import { aiAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const CulturalConciergePage = () => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Namaste! 🙏 I'm your AI Cultural Concierge. I can help you discover authentic rural experiences, plan your journey, and learn about local customs. What kind of cultural adventure are you looking for?",
      timestamp: new Date(),
      suggestions: [
        "Plan a spiritual retreat",
        "Find heritage homestays",
        "Discover local festivals",
        "Learn about customs"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    budget_range: 'medium',
    interests: [],
    travel_style: 'cultural',
    group_size: 2
  });
  const messagesEndRef = useRef(null);
  const recognition = useRef(null);

  useEffect(() => {
    // Initialize session ID
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    // Initialize speech recognition if available
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';
      
      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };
      
      recognition.current.onerror = () => {
        setIsListening(false);
        toast.error('Speech recognition failed');
      };
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiAPI.culturalConcierge({
        message: message,
        session_id: sessionId,
        ...userPreferences
      });

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.response,
        timestamp: new Date(),
        actionable_items: response.data.actionable_items,
        cultural_insights: response.data.cultural_insights,
        relevant_listings: response.data.relevant_listings,
        suggested_experiences: response.data.suggested_experiences,
        local_events: response.data.local_events
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Fallback to demo API
      try {
        const demoResponse = await aiAPI.demoCulturalChat({ message });
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: demoResponse.data.response,
          timestamp: new Date(),
          actionable_items: demoResponse.data.actionable_items,
          cultural_insights: demoResponse.data.cultural_insights
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (demoError) {
        toast.error('Failed to get AI response');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceRecognition = () => {
    if (recognition.current && !isListening) {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const stopVoiceRecognition = () => {
    if (recognition.current && isListening) {
      recognition.current.stop();
      setIsListening(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Providers>
      <AppLayout>
        <div className="min-h-screen village-bg pt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                AI Cultural Concierge
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get personalized recommendations, cultural insights, and travel planning assistance from our AI guide.
              </p>
            </div>

            {/* Preferences Panel */}
            <div className="card p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Travel Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                  <select
                    value={userPreferences.budget_range}
                    onChange={(e) => setUserPreferences(prev => ({ ...prev, budget_range: e.target.value }))}
                    className="input-field"
                  >
                    <option value="low">Budget (₹500-1500/day)</option>
                    <option value="medium">Medium (₹1500-3000/day)</option>
                    <option value="high">Premium (₹3000+/day)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Travel Style</label>
                  <select
                    value={userPreferences.travel_style}
                    onChange={(e) => setUserPreferences(prev => ({ ...prev, travel_style: e.target.value }))}
                    className="input-field"
                  >
                    <option value="cultural">Cultural Immersion</option>
                    <option value="spiritual">Spiritual Journey</option>
                    <option value="adventure">Adventure & Nature</option>
                    <option value="culinary">Food & Cooking</option>
                    <option value="wellness">Wellness & Yoga</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Group Size</label>
                  <select
                    value={userPreferences.group_size}
                    onChange={(e) => setUserPreferences(prev => ({ ...prev, group_size: parseInt(e.target.value) }))}
                    className="input-field"
                  >
                    <option value={1}>Solo Traveler</option>
                    <option value={2}>Couple</option>
                    <option value={4}>Small Group (3-4)</option>
                    <option value={8}>Large Group (5-8)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select className="input-field">
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                    <option value="gu">ગુજરાતી</option>
                    <option value="te">తెలుగు</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Chat Container */}
            <div className="card p-0 overflow-hidden h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.type === 'user'
                              ? 'bg-gradient-to-br from-green-500 to-green-600'
                              : 'bg-gradient-to-br from-blue-500 to-blue-600'
                          }`}>
                            {message.type === 'user' ? (
                              <span className="text-white font-semibold text-sm">
                                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            ) : (
                              <SparklesIcon className="w-5 h-5 text-white" />
                            )}
                          </div>
                          
                          {/* Message Content */}
                          <div className={`flex-1 ${message.type === 'user' ? 'text-right' : ''}`}>
                            <div className={`inline-block p-4 rounded-2xl ${
                              message.type === 'user'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            </div>
                            
                            <p className="text-xs text-gray-500 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                            
                            {/* Suggestions */}
                            {message.suggestions && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {message.suggestions.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full transition-colors duration-200"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            )}
                            
                            {/* Cultural Insights */}
                            {message.cultural_insights && (
                              <div className="mt-4 space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700">Cultural Insights:</h4>
                                {message.cultural_insights.map((insight, index) => (
                                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-sm text-gray-700">{insight.insight}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Relevant Listings */}
                            {message.relevant_listings && message.relevant_listings.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Recommended Stays:</h4>
                                <div className="space-y-2">
                                  {message.relevant_listings.slice(0, 3).map((listing, index) => (
                                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <h5 className="font-medium text-gray-900">{listing.title}</h5>
                                          <p className="text-sm text-gray-600">{listing.location}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-semibold text-gray-900">₹{listing.price_per_night}</p>
                                          <p className="text-xs text-gray-500">per night</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Actionable Items */}
                            {message.actionable_items && message.actionable_items.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {message.actionable_items.map((item, index) => (
                                  <button
                                    key={index}
                                    className="btn-outline btn-sm"
                                  >
                                    {item.action}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* Loading Message */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <SparklesIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl p-4">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <div className="relative">
                      <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={isAuthenticated ? "Ask me about rural experiences, cultural insights, or travel planning..." : "Please login to chat with AI"}
                        disabled={!isAuthenticated || isLoading}
                        rows={1}
                        className="input-field resize-none pr-12"
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                      />
                      
                      {/* Voice Input Button */}
                      {recognition.current && (
                        <button
                          type="button"
                          onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                          disabled={!isAuthenticated}
                          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${
                            isListening 
                              ? 'bg-red-500 text-white' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {isListening ? (
                            <StopIcon className="w-5 h-5" />
                          ) : (
                            <MicrophoneIcon className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isLoading || !isAuthenticated}
                    className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </div>
                
                {!isAuthenticated && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    Please <button className="text-green-600 hover:text-green-700">sign in</button> to chat with the AI Cultural Concierge
                  </p>
                )}
                
                {isListening && (
                  <p className="text-center text-sm text-red-600 mt-2 animate-pulse">
                    🎤 Listening... Speak now
                  </p>
                )}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
              <button
                onClick={() => handleSuggestionClick("Plan a 3-day spiritual retreat under ₹5000")}
                className="card p-4 text-left hover:shadow-lg transition-shadow duration-200"
              >
                <CalendarIcon className="w-8 h-8 text-purple-500 mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Plan Retreat</h3>
                <p className="text-sm text-gray-600">Get spiritual journey recommendations</p>
              </button>
              
              <button
                onClick={() => handleSuggestionClick("Find heritage homestays in Rajasthan")}
                className="card p-4 text-left hover:shadow-lg transition-shadow duration-200"
              >
                <MapPinIcon className="w-8 h-8 text-blue-500 mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Find Heritage Stays</h3>
                <p className="text-sm text-gray-600">Discover historic accommodations</p>
              </button>
              
              <button
                onClick={() => handleSuggestionClick("What festivals are happening this month?")}
                className="card p-4 text-left hover:shadow-lg transition-shadow duration-200"
              >
                <SparklesIcon className="w-8 h-8 text-green-500 mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Local Festivals</h3>
                <p className="text-sm text-gray-600">Find cultural celebrations</p>
              </button>
              
              <button
                onClick={() => handleSuggestionClick("Teach me about local customs in Gujarat")}
                className="card p-4 text-left hover:shadow-lg transition-shadow duration-200"
              >
                <UserGroupIcon className="w-8 h-8 text-orange-500 mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Learn Customs</h3>
                <p className="text-sm text-gray-600">Understand local traditions</p>
              </button>
            </div>
          </div>
        </div>
      </AppLayout>
    </Providers>
  );
};

export default CulturalConciergePage;