'use client';

import React from 'react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Página de Teste</h1>
      <p className="text-lg text-gray-700 mb-4">
        Se você consegue ver esta página, o React está funcionando corretamente no cliente.
      </p>
      <div className="bg-green-100 border border-green-400 p-4 rounded">
        <p className="text-green-800">
          ✅ Componente React renderizado com sucesso!
        </p>
      </div>
      <div className="mt-4">
        <button 
          onClick={() => alert('JavaScript está funcionando!')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Testar JavaScript
        </button>
      </div>
    </div>
  );
}