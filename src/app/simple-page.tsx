'use client';

import React from 'react';

export default function SimplePage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Sistema de Controle de Trips
      </h1>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-green-50 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Método Validado pela EMBRAPA
          </h2>
          <p className="text-lg text-gray-700 mb-4">
            Descubra o Sistema de 4 Fases que elimina o trips de vez e 
            economiza até R$ 5.000 por hectare em defensivos ineficazes.
          </p>
        </div>

        <div className="bg-red-50 p-6 rounded-lg mb-8">
          <h3 className="text-xl font-bold text-red-600 mb-4">
            OFERTA RELÂMPAGO - APENAS HOJE!
          </h3>
          <div className="text-3xl font-black text-red-600 mb-2">
            R$ 39,90
          </div>
          <div className="text-lg line-through text-gray-500 mb-4">
            R$ 297,00
          </div>
          <div className="bg-yellow-400 text-red-600 px-4 py-2 rounded-full font-black inline-block">
            87% OFF
          </div>
        </div>

        <div className="text-center">
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-full text-xl transform hover:scale-105 transition-all duration-200">
            QUERO ECONOMIZAR R$ 5.000 AGORA!
          </button>
        </div>
      </div>
    </div>
  );
}