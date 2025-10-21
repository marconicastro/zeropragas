'use client';

import React from 'react';
import GTMTriggerDiagnostic from '@/components/GTMTriggerDiagnostic';

export default function TriggerDiagnosticPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <GTMTriggerDiagnostic />
      </div>
    </div>
  );
}