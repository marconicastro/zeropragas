'use client';

import React from 'react';
import CookieDiagnostic from '@/components/CookieDiagnostic';

export default function CookieDiagnosticPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <CookieDiagnostic />
      </div>
    </div>
  );
}