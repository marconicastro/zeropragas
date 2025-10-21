'use client';

import React from 'react';
import GTMConfigurationValidator from '@/components/GTMConfigurationValidator';

export default function GTMValidatorPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <GTMConfigurationValidator />
      </div>
    </div>
  );
}