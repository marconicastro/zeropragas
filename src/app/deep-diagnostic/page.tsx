'use client';

import React from 'react';
import GTMDeepDiagnostic from '@/components/GTMDeepDiagnostic';

export default function DeepDiagnosticPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <GTMDeepDiagnostic />
      </div>
    </div>
  );
}