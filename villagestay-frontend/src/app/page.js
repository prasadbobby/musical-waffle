// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import AppLayout from '@/components/layout/AppLayout';
import InteractiveCard from '@/components/ui/InteractiveCard';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { 
  SparklesIcon, 
  ChatBubbleLeftRightIcon, 
  MicrophoneIcon,
  PlayCircleIcon,
  MapPinIcon,
  StarIcon,
  HeartIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  UsersIcon,
  TrophyIcon,
  ShieldCheckIcon,
  BoltIcon,
  EyeIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

// Dynamically import 3D scene with no SSR
const Scene3DWrapper = dynamic(() => import('@/components/3d/Scene3DWrapper'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white font-bold text-2xl">V</span>
        </div>
        <p className="text-gray-600">Loading 3D Experience...</p>
      </div>
    </div>
  ),
});

const HomePage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [featuredListings, setFeaturedListings] = useState([]);
  const [isClient, setIsClient] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle mouse movement for interactive effects
  useEffect(() => {
    if (!isClient) return;
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isClient]);

  // Mock data for demo
  const mockListings = [
    {
      id: '1',
      title: 'Himalayan Village Retreat',
      location: 'Uttarakhand Hills',
      price_per_night: 2000,
      rating: 4.9,
      images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'],
      property_type: 'homestay',
      host: 'Priya Sharma'
    },
    {
      id: '2',
      title: 'Traditional Rajasthani Haveli',
      location: 'Jodhpur, Rajasthan',
      price_per_night: 2500,
      rating: 4.8,
      images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop'],
      property_type: 'heritage_home',
      host: 'Raj Singh'
    },
    {
      id: '3',
      title: 'Kerala Backwater Homestay',
      location: 'Alleppey, Kerala',
      price_per_night: 1800,
      rating: 4.7,
      images: ['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop'],
      property_type: 'farmstay',
      host: 'Meera Nair'
    }
  ];

  useEffect(() => {
    setFeaturedListings(mockListings);
  }, []);

  const aiFeatures = [
    {
      icon: MicrophoneIcon,
      title: 'Voice-to-Listing Magic',
      description: 'Speak in your local language and AI creates a professional listing instantly',
      color: 'from-purple-500 to-purple-600',
      demo: '/ai-features/voice-listing',
      features: ['Multi-language support', 'Auto-enhancement', 'Smart pricing']
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'AI Cultural Concierge',
      description: 'Get personalized travel recommendations and cultural insights',
      color: 'from-blue-500 to-blue-600',
      demo: '/ai-features/cultural-concierge',
      features: ['24/7 assistance', 'Cultural insights', 'Personalized recommendations']
    },
    {
      icon: PlayCircleIcon,
      title: 'Village Story Videos',
      description: 'AI generates cinematic videos showcasing your village experience',
      color: 'from-green-500 to-green-600',
      demo: '/ai-features/village-stories',
      features: ['Auto video creation', 'Professional quality', 'Social ready']
    }
  ];

  const stats = [
    { label: 'Rural Communities', value: 50, icon: MapPinIcon, suffix: '+' },
    { label: 'Happy Travelers', value: 1000, icon: HeartIcon, suffix: '+' },
    { label: 'CO₂ Saved', value: 5000, icon: GlobeAltIcon, suffix: 'kg' },
    { label: 'Local Jobs', value: 200, icon: TrophyIcon, suffix: '+' },
  ];

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <AppLayout>
      <div className="min-h-screen overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50" />
          {isClient && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`,
              }}
            />
          )}
        </div>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
          {/* 3D Background - Only render on client */}
          {isClient && (
            <div className="absolute inset-0 z-0 opacity-60">
              <Scene3DWrapper />
            </div>
          )}

          {/* Fallback Background for SSR */}
          {!isClient && (
            <div className="absolute inset-0 z-0">
              <div className="w-full h-full bg-gradient-to-br from-blue-100 via-white to-green-100 flex items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 180, 360] 
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="w-32 h-32 bg-gradient-to-br from-blue-500 to-green-500 rounded-3xl opacity-20"
                />
              </div>
            </div>
          )}

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="text-center lg:text-left"
              >
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="mb-6"
                >
                  <span className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium text-gray-700 border border-white/30">
                    <SparklesIcon className="w-4 h-4 mr-2 text-blue-500" />
                    AI-Powered Rural Tourism Platform
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
                >
                  Discover
                  <motion.span
                    className="block bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent"
                    animate={{ 
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                  >
                    Rural India
                  </motion.span>
                  <span className="block text-gray-700">with AI Magic</span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
                >
                  Experience authentic village life with cutting-edge AI technology. 
                  From voice-powered listings to personalized cultural guidance.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      href="/listings" 
                      className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      Explore Villages
                      <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      href="/ai-features/cultural-concierge" 
                      className="group inline-flex items-center px-8 py-4 bg-white/80 backdrop-blur-md text-gray-800 font-semibold rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <SparklesIcon className="w-5 h-5 mr-2 text-blue-500" />
                      Try AI Guide
                    </Link>
                  </motion.div>
                </motion.div>
                
                {/* Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                  className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-600"
                >
                  <div className="flex items-center space-x-2">
                    <StarIcon className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium">4.9/5 Rating</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">1000+ Travelers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                    <span className="font-medium">AI-Verified</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Content - Interactive Stats */}
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="relative lg:block hidden"
              >
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <InteractiveCard
                      key={stat.label}
                      className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30"
                      hoverScale={1.1}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="text-center"
                      >
                        <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                          {isClient ? <AnimatedCounter value={stat.value} /> : stat.value}
                          <span>{stat.suffix}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-600">
                          {stat.label}
                        </div>
                      </motion.div>
                    </InteractiveCard>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-3 bg-gray-400 rounded-full mt-2"
              />
            </motion.div>
          </motion.div>
        </section>

        {/* AI Features Section */}
        <section className="relative py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <span className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-sm font-medium text-blue-700 mb-6">
                <BoltIcon className="w-4 h-4 mr-2" />
                Powered by Advanced AI
              </span>
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Revolutionary AI Experience
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Harness the power of artificial intelligence to transform rural tourism. 
                Our cutting-edge AI makes travel planning effortless and authentic.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {aiFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 100 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <InteractiveCard className="h-full">
                    <div className="bg-white rounded-3xl p-8 h-full shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}
                      >
                        <feature.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-6 leading-relaxed text-center">
                        {feature.description}
                      </p>
                      
                      <div className="space-y-3 mb-6">
                        {feature.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center space-x-3">
                            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{feat}</span>
                          </div>
                        ))}
                      </div>
                      
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          href={feature.demo}
                          className="group inline-flex items-center justify-center w-full py-3 px-6 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-300"
                        >
                          Try Demo
                          <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </motion.div>
                    </div>
                  </InteractiveCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Listings Section */}
        <section className="relative py-32 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Featured Village Experiences
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Handpicked authentic experiences that showcase the beauty and culture of rural India.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 100 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <InteractiveCard>
                    <Link href={`/listings/${listing.id}`}>
                      <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
                        <div className="relative overflow-hidden">
                          <motion.img
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.6 }}
                            src={listing.images?.[0]}
                            alt={listing.title}
                            className="w-full h-64 object-cover"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/400x300/22c55e/ffffff?text=Village+Stay';
                            }}
                          />
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                            <div className="flex items-center space-x-1">
                              <StarIcon className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm font-semibold">{listing.rating}</span>
                            </div>
                          </div>
                          <div className="absolute top-4 left-4 bg-green-500 text-white rounded-lg px-3 py-1 text-xs font-medium">
                            Featured
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {listing.title}
                          </h3>
                          
                          <div className="flex items-center space-x-2 text-gray-600 mb-4">
                            <MapPinIcon className="w-4 h-4" />
                            <span className="text-sm">{listing.location}</span>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <span className="text-2xl font-bold text-gray-900">
                                {formatCurrency(listing.price_per_night)}
                              </span>
                              <span className="text-sm text-gray-500">/night</span>
                            </div>
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium capitalize">
                              {listing.property_type?.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <UsersIcon className="w-4 h-4" />
                            <span>Hosted by {listing.host}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </InteractiveCard>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/listings" 
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <EyeIcon className="w-5 h-5 mr-2" />
                  View All Villages
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-32 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          >
            <h3 className="text-5xl font-bold text-white mb-6">
              Ready to Explore Rural India?
            </h3>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Join thousands of travelers discovering authentic experiences with our AI-powered platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/auth/register" 
                  className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Start Your Journey
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="/ai-features/cultural-concierge" 
                  className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-2xl border border-white/30 hover:bg-white/20 transition-all duration-300"
                >
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Chat with AI Guide
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </div>
    </AppLayout>
  );
};

export default HomePage;