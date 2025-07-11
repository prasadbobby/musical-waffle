// src/app/ai-features/voice-listing/page.js
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MicrophoneIcon,
  StopIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  SparklesIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
// import AppLayout from '@/components/layout/AppLayout';
import { aiAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

const VoiceListingPage = () => {
  const router = useRouter();
  const { user, isHost, isAuthenticated, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [generatedListing, setGeneratedListing] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customEdits, setCustomEdits] = useState({});
  const [recordingTime, setRecordingTime] = useState(0);
  const [accessChecked, setAccessChecked] = useState(false);
  
  const mediaRecorder = useRef(null);
  const audioRef = useRef(null);
  const recordingInterval = useRef(null);

  useEffect(() => {
    // Wait for auth to complete loading
    if (!loading) {
      setAccessChecked(true);
      
      if (!isAuthenticated) {
        toast.error('Please login to access this feature');
        router.push('/auth/login');
        return;
      }

      if (!isHost) {
        toast.error('Only hosts can access voice listing feature');
        router.push('/');
        return;
      }

      // Initialize media recorder only after auth check passes
      initializeMediaRecorder();
    }
  }, [loading, isAuthenticated, isHost, router]);

  const initializeMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioBlob(event.data);
          setAudioUrl(URL.createObjectURL(event.data));
        }
      };
      
      mediaRecorder.current.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Please allow microphone access to use voice listing');
    }
  };

  // Show loading state while checking authentication
  if (loading || !accessChecked) {
    return (
        <div className="min-h-screen village-bg pt-20 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner spinner-lg mx-auto mb-4"></div>
            <p className="text-gray-600">Checking access permissions...</p>
          </div>
        </div>
    );
  }

  // Don't render the component if user doesn't have access
  if (!isAuthenticated || !isHost) {
    return null; // This will be handled by the useEffect redirect
  }

  const startRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'inactive') {
      setIsRecording(true);
      setRecordingTime(0);
      setAudioBlob(null);
      setAudioUrl(null);
      
      mediaRecorder.current.start();
      
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      setIsRecording(false);
      mediaRecorder.current.stop();
      
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const retryRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscription('');
    setGeneratedListing(null);
    setCurrentStep(1);
    setRecordingTime(0);
  };

  const processVoiceToListing = async () => {
    if (!audioBlob) {
      toast.error('Please record audio first');
      return;
    }

    setIsProcessing(true);
    setCurrentStep(2);

    try {
      // First, demonstrate transcription
      const demoResponse = await aiAPI.demoVoiceTranscription({
        language: selectedLanguage
      });
      
      setTranscription(demoResponse.data.transcribed_text);
      
      // Then process the voice to listing
      const formData = new FormData();
      formData.append('audio_data', audioBlob);
      formData.append('language', selectedLanguage);

      const response = await aiAPI.voiceToListing(formData);
      setGeneratedListing(response.data.result);
      setCurrentStep(3);
      
      toast.success('Voice successfully converted to listing!');
    } catch (error) {
      console.error('Voice processing failed:', error);
      toast.error('Failed to process voice. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const createListingFromVoice = async () => {
    if (!generatedListing) return;

    setIsProcessing(true);
    try {
      const response = await aiAPI.createListingFromVoice({
        processing_id: generatedListing.processing_id || 'demo',
        selected_language: 'en',
        custom_edits: customEdits
      });

      toast.success('Listing created successfully!');
      router.push(`/host/listings/${response.data.listing_id}`);
    } catch (error) {
      console.error('Failed to create listing:', error);
      toast.error('Failed to create listing. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const languages = [
    { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు (Telugu)', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी (Marathi)', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  ];

  return (
    // <AppLayout>
      <div className="min-h-screen village-bg pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MicrophoneIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Voice-to-Listing Magic ✨
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Speak about your property in your local language, and our AI will create a professional listing for you instantly.
            </p>
          </div>

          {/* Host Verification Badge */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
              <CheckIcon className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">Host Account Verified</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step ? (
                      <CheckIcon className="w-6 h-6" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      currentStep > step ? 'bg-purple-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {/* Step 1: Language Selection & Recording */}
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="card p-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Record Your Property Description
                  </h2>

                  {/* Language Selection */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Choose your preferred language:
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setSelectedLanguage(lang.code)}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                            selectedLanguage === lang.code
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-purple-300 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">{lang.flag}</span>
                            <span className="font-medium text-sm">{lang.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recording Interface */}
                  <div className="text-center">
                    <div className="relative mb-8">
                      <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                        isRecording 
                          ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' 
                          : 'bg-purple-500 hover:bg-purple-600 shadow-lg hover:shadow-xl'
                      }`}>
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          className="w-full h-full rounded-full flex items-center justify-center text-white"
                        >
                          {isRecording ? (
                            <StopIcon className="w-12 h-12" />
                          ) : (
                            <MicrophoneIcon className="w-12 h-12" />
                          )}
                        </button>
                      </div>
                      
                      {isRecording && (
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                          <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {formatTime(recordingTime)}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {isRecording ? 'Recording...' : 'Click to start recording'}
                      </h3>
                      
                      <div className="max-w-lg mx-auto">
                        <p className="text-gray-600 mb-4">
                          Describe your property in detail. Include:
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1 text-left">
                          <li>• Property type (house, farm, cottage)</li>
                          <li>• Location and surroundings</li>
                          <li>• Number of rooms and facilities</li>
                          <li>• What makes it special</li>
                          <li>• Activities guests can enjoy</li>
                          <li>• Food and hospitality offered</li>
                        </ul>
                      </div>
                    </div>

                    {/* Audio Playback */}
                    {audioUrl && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-4 bg-gray-50 rounded-xl"
                      >
                        <div className="flex items-center justify-center space-x-4">
                          <button
                            onClick={playAudio}
                            className="w-12 h-12 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center text-white transition-colors duration-200"
                          >
                            {isPlaying ? (
                              <PauseIcon className="w-6 h-6" />
                            ) : (
                              <PlayIcon className="w-6 h-6" />
                            )}
                          </button>
                          <span className="text-gray-700 font-medium">
                            Recorded Audio ({formatTime(recordingTime)})
                          </span>
                          <button
                            onClick={retryRecording}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <ArrowPathIcon className="w-5 h-5" />
                          </button>
                        </div>
                        <audio
                          ref={audioRef}
                          src={audioUrl}
                          onEnded={() => setIsPlaying(false)}
                          className="hidden"
                        />
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-8 flex justify-center space-x-4">
                      {audioBlob && (
                        <>
                          <button
                            onClick={retryRecording}
                            className="btn-secondary"
                          >
                            Record Again
                          </button>
                          <button
                            onClick={processVoiceToListing}
                            disabled={isProcessing}
                            className="btn-primary"
                          >
                            {isProcessing ? (
                              <div className="flex items-center">
                                <div className="spinner mr-2"></div>
                                Processing...
                              </div>
                            ) : (
                              'Generate Listing'
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Processing & Transcription */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="card p-8 text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <SparklesIcon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    AI is Working Its Magic ✨
                  </h2>
                  
                  <div className="space-y-4 max-w-md mx-auto">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">Converting speech to text</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-700">Enhancing with AI</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span className="text-gray-500">Generating pricing suggestions</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span className="text-gray-500">Creating translations</span>
                    </div>
                  </div>

                  {transcription && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 p-4 bg-gray-50 rounded-xl text-left"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">Transcription:</h3>
                      <p className="text-gray-700 italic">"{transcription}"</p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Step 3: Generated Listing */}
              {currentStep === 3 && generatedListing && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="card p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Your Generated Listing
                      </h2>
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckIcon className="w-5 h-5" />
                        <span className="font-medium">Ready to publish!</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Property Title
                        </label>
                        <input
                          type="text"
                          value={customEdits.title || generatedListing.enhanced_listing?.title || 'Traditional Village Homestay'}
                          onChange={(e) => setCustomEdits(prev => ({ ...prev, title: e.target.value }))}
                          className="input-field"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          rows={6}
                          value={customEdits.description || generatedListing.enhanced_listing?.description || 'Experience authentic village life in our traditional home...'}
                          onChange={(e) => setCustomEdits(prev => ({ ...prev, description: e.target.value }))}
                          className="input-field resize-none"
                        />
                      </div>

                      {/* Property Type & Pricing */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Property Type
                          </label>
                          <select
                            value={customEdits.property_type || generatedListing.enhanced_listing?.property_type || 'homestay'}
                            onChange={(e) => setCustomEdits(prev => ({ ...prev, property_type: e.target.value }))}
                            className="input-field"
                          >
                            <option value="homestay">Homestay</option>
                            <option value="farmstay">Farmstay</option>
                            <option value="heritage_home">Heritage Home</option>
                            <option value="eco_lodge">Eco Lodge</option>
                            <option value="village_house">Village House</option>
                            <option value="cottage">Cottage</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price per Night (₹)
                          </label>
                          <input
                            type="number"
                            value={customEdits.price_per_night || generatedListing.pricing_intelligence?.base_price_per_night || 2000}
                            onChange={(e) => setCustomEdits(prev => ({ ...prev, price_per_night: parseInt(e.target.value) }))}
                            className="input-field"
                          />
                        </div>
                      </div>

                      {/* Amenities */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amenities
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(generatedListing.enhanced_listing?.amenities || ['Home-cooked meals', 'Wi-Fi', 'Local guide', 'Traditional activities']).map((amenity, index) => (
                            <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* AI Suggestions */}
                      {generatedListing.pricing_intelligence && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <h3 className="font-semibold text-blue-900 mb-2">AI Pricing Suggestions</h3>
                          <div className="text-sm text-blue-700 space-y-1">
                            <p>• Base price: ₹{generatedListing.pricing_intelligence.base_price_per_night}</p>
                            <p>• {generatedListing.pricing_intelligence.reasoning}</p>
                          </div>
                        </div>
                      )}

                      {/* Translations Available */}
                      {generatedListing.translations && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <h3 className="font-semibold text-green-900 mb-2">Available in Multiple Languages</h3>
                          <div className="flex flex-wrap gap-2">
                            {Object.keys(generatedListing.translations).map((lang) => (
                              <span key={lang} className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs">
                                {languages.find(l => l.code === lang)?.name || lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex justify-between">
                      <button
                        onClick={retryRecording}
                        className="btn-secondary"
                      >
                        Start Over
                      </button>
                      
                      <div className="space-x-4">
                        <button className="btn-outline">
                          Save as Draft
                        </button>
                        <button
                          onClick={createListingFromVoice}
                          disabled={isProcessing}
                          className="btn-primary"
                        >
                          {isProcessing ? (
                            <div className="flex items-center">
                              <div className="spinner mr-2"></div>
                              Creating...
                            </div>
                          ) : (
                            'Publish Listing'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tips */}
          <div className="mt-12 card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Tips for Better Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Recording Tips:</h4>
                <ul className="space-y-1">
                  <li>• Speak clearly and at a moderate pace</li>
                  <li>• Use a quiet environment</li>
                  <li>• Keep recording under 3 minutes</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Content Tips:</h4>
                <ul className="space-y-1">
                  <li>• Mention unique features of your property</li>
                  <li>• Describe the local area and attractions</li>
                  <li>• Include any special services you offer</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default VoiceListingPage;