'use client';

import React from 'react';

export default function SimplePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-green-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-black text-green-600 mb-4">
              SISTEMA DE CONTROLE DE TRIPS
            </h1>
            <p className="text-xl text-gray-700 mb-6">
              Versão simplificada para teste de renderização
            </p>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-lg">
                ✅ Página carregada com sucesso no cliente!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}