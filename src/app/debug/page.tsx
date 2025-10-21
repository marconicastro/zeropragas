'use client';

import React from 'react';
import DebugTools from '@/components/DebugTools';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <DebugTools />
      </div>
    </div>
  );
}