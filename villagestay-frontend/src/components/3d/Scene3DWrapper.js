// src/components/3d/Scene3DWrapper.js
'use client';

import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';

// Lazy load the 3D scene to avoid SSR issues
const Scene3D = lazy(() => import('./Scene3D'));

const Scene3DFallback = () => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <span className="text-white font-bold text-2xl">V</span>
      </div>
      <p className="text-gray-600">Loading 3D Experience...</p>
    </motion.div>
  </div>
);

const Scene3DWrapper = () => {
  return (
    <Suspense fallback={<Scene3DFallback />}>
      <Scene3D />
    </Suspense>
  );
};

export default Scene3DWrapper;