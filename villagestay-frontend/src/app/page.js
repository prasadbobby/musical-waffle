'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Providers from '@/components/providers/Providers';
import AppLayout from '@/components/layout/AppLayout';
import { 
  SparklesIcon, 
  ChatBubbleLeftRightIcon, 
  MicrophoneIcon,
  PlayCircleIcon,
  MapPinIcon,
  StarIcon,
  HeartIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const [featuredListings, setFeaturedListings] = useState([]);

  // Mock data for demo
  const mockListings = [
    {
      id: '1',
      title: 'Peaceful Himalayan Village Retreat',
      location: 'Uttarakhand Hills',
      price_per_night: 2000,
      rating: 4.9,
      images: ['https://via.placeholder.com/400x240/22c55e/ffffff?text=Himalayan+Retreat'],
      property_type: 'homestay'
    },
    {
      id: '2',
      title: 'Traditional Rajasthani Haveli',
      location: 'Jodhpur, Rajasthan',
      price_per_night: 2500,
      rating: 4.8,
      images: ['https://via.placeholder.com/400x240/16a34a/ffffff?text=Rajasthani+Haveli'],
      property_type: 'heritage_home'
    },
    {
      id: '3',
      title: 'Organic Farm Experience',
      location: 'Punjab Villages',
      price_per_night: 1800,
      rating: 4.7,
      images: ['https://via.placeholder.com/400x240/15803d/ffffff?text=Farm+Experience'],
      property_type: 'farmstay'
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
      demo: '/ai-features/voice-listing'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'AI Cultural Concierge',
      description: 'Get personalized travel recommendations and cultural insights',
      color: 'from-blue-500 to-blue-600',
      demo: '/ai-features/cultural-concierge'
    },
    {
      icon: PlayCircleIcon,
      title: 'Village Story Videos',
      description: 'AI generates cinematic videos showcasing your village experience',
      color: 'from-green-500 to-green-600',
      demo: '/ai-features/village-stories'
    }
  ];

  const stats = [
    { label: 'Rural Communities', value: '50+', icon: MapPinIcon },
    { label: 'Happy Travelers', value: '1000+', icon: HeartIcon },
    { label: 'CO₂ Saved', value: '5000kg', icon: GlobeAltIcon },
    { label: 'Local Jobs', value: '200+', icon: StarIcon },
  ];

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <Providers>
      <AppLayout>
        <div className="min-h-screen">
          {/* Hero Section */}
          <section className="relative hero-bg pt-20 pb-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-white/30"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Hero Content */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center lg:text-left"
                >
                  <h1 className="hero-title text-gray-900 mb-6">
                    Discover
                    <span className="village-gradient block">Authentic Rural India</span>
                    <span className="text-gray-700">with AI Power</span>
                  </h1>
                  
                  <p className="hero-subtitle text-gray-600 mb-8 leading-relaxed">
                    Experience genuine village life, connect with local communities, and create 
                    meaningful memories with our AI-powered cultural concierge.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Link href="/listings" className="btn-primary">
                      Explore Villages
                    </Link>
                    <Link href="/ai-features/cultural-concierge" className="btn-secondary">
                      Try AI Guide
                    </Link>
                  </div>
                  
                  {/* Trust indicators */}
                  <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="w-4 h-4 text-yellow-400" />
                      <span>4.9/5 Rating</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <HeartIcon className="w-4 h-4 text-red-400" />
                      <span>1000+ Happy Travelers</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <SparklesIcon className="w-4 h-4 text-green-400" />
                      <span>AI-Powered</span>
                    </div>
                  </div>
                </motion.div>

                {/* Hero Visual */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative"
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-village-lg">
                    <img
                      src="https://via.placeholder.com/600x400/22c55e/ffffff?text=Beautiful+Rural+Village"
                      alt="Beautiful rural village"
                      className="w-full h-96 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    
                    {/* Floating stats */}
                    <div className="absolute top-4 right-4 village-card rounded-xl p-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">50+</div>
                        <div className="text-xs text-gray-600">Villages</div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 village-card rounded-xl p-3">
                      <div className="flex items-center space-x-2">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">AI Guide Available</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute top-20 left-10 w-20 h-20 bg-green-200 rounded-full opacity-20 animate-pulse-slow"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse-slow"></div>
          </section>

          {/* AI Features Section */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="section-title">
                  AI-Powered Travel Experience
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Discover the magic of AI that makes rural tourism accessible, authentic, and amazing for everyone.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {aiFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <div className="card card-hover p-8 text-center h-full">
                      <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {feature.description}
                      </p>
                      
                      <Link
                        href={feature.demo}
                        className="inline-flex items-center space-x-1 text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                      >
                        <span>Try Demo</span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Listings Section */}
          <section className="py-20 village-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="section-title">
                  Featured Village Stays
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Hand-picked authentic experiences that showcase the beauty and culture of rural India.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredListings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <Link href={`/listings/${listing.id}`}>
                      <div className="card card-hover p-0 overflow-hidden">
                        <div className="relative">
                          <img
                            src={listing.images?.[0]}
                            alt={listing.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3 bg-white rounded-lg px-2 py-1 shadow-md">
                            <div className="flex items-center space-x-1">
                              <StarIcon className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm font-medium">{listing.rating}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-200">
                            {listing.title}
                          </h3>
                          
                          <div className="flex items-center space-x-1 text-gray-500 mb-3">
                            <MapPinIcon className="w-4 h-4" />
                            <span className="text-sm">{listing.location}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency(listing.price_per_night)}
                              <span className="text-sm font-normal text-gray-500">/night</span>
                            </div>
                            
                            <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              {listing.property_type?.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center mt-12"
              >
                <Link href="/listings" className="btn-primary">
                  View All Villages
                </Link>
              </motion.div>
            </div>
          </section>

          {/* Impact Stats Section */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="section-title">
                  Creating Positive Impact Together
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Every stay on VillageStay contributes to sustainable tourism and supports rural communities across India.
                </p>
              </motion.div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-center mt-16"
              >
                <div className="village-card rounded-3xl p-8 md:p-12 max-w-4xl mx-auto">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    Ready to Explore Rural India?
                  </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Join thousands of travelers who have discovered authentic experiences and 
                    contributed to sustainable rural tourism with our AI-powered platform.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/auth/register" className="btn-primary">
                      Start Your Journey
                    </Link>
                    <Link href="/ai-features/cultural-concierge" className="btn-secondary">
                      Chat with AI Guide
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </AppLayout>
    </Providers>
  );
};

export default HomePage;