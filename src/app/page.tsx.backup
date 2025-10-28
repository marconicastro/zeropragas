'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, AlertTriangle, Clock, Shield, Star, Rocket, Phone, Mail, TrendingUp, Target, Zap, Award, Users, DollarSign, ArrowRight, PlayCircle, Download } from 'lucide-react';
import PreCheckoutModal from '@/components/PreCheckoutModal';
import OptimizedImage from '@/components/OptimizedImage';
import { fireScrollDepthDefinitivo, fireViewContentDefinitivo, fireCTAClickDefinitivo } from '@/lib/meta-pixel-definitivo';
import { fireLeadDefinitivo, fireInitiateCheckoutDefinitivo } from '@/lib/meta-pixel-definitivo';
import { saveUserData, getPersistedUserData, formatUserDataForMeta } from '@/lib/userDataPersistence';
import { getCurrentModeDefinitivo } from '@/lib/meta-pixel-definitivo';
import DebugPersistence from '@/components/DebugPersistence';

export default function App() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 47,
    seconds: 0
  });

  // Estado para controlar o modal de pré-checkout
  const [isPreCheckoutModalOpen, setIsPreCheckoutModalOpen] = useState(false);

  // Estado para controlar eventos de scroll já disparados
  const [scrollEventsFired, setScrollEventsFired] = useState({
    '50': false,
    '75': false
  });

  // Estado para controle de ViewContent (EVITAR DUPLICIDADE)
  const [viewContentFired, setViewContentFired] = useState(false);

  // Estado para dados do usuário (agora com persistência)
  const [userData, setUserData] = useState<{
    email?: string;
    phone?: string;
    fullName?: string;
    city?: string;
    state?: string;
    cep?: string;
  }>({});

  // Estado para o modo de operação (SISTEMA DEFINITIVO)
  const [currentMode, setCurrentMode] = useState(getCurrentModeDefinitivo());

  // Inicializar dados persistidos ao montar o componente
  useEffect(() => {
    const persistedData = getPersistedUserData();
    if (persistedData) {
      setUserData({
        email: persistedData.email,
        phone: persistedData.phone,
        fullName: persistedData.fullName,
        city: persistedData.city,
        state: persistedData.state,
        cep: persistedData.cep
      });
      console.log('🎯 Dados persistidos carregados no estado do componente');
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // useEffect para rastreamento de scroll
  useEffect(() => {
    const handleScroll = async () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      const scrollPercentage = Math.round((scrollPosition / scrollHeight) * 100);

      // Disparar evento de 50% do scroll
      if (scrollPercentage >= 50 && !scrollEventsFired['50']) {
        await fireScrollDepthDefinitivo(50);
        setScrollEventsFired(prev => ({ ...prev, '50': true }));
      }

      // Disparar evento de 75% do scroll
      if (scrollPercentage >= 75 && !scrollEventsFired['75']) {
        await fireScrollDepthDefinitivo(75);
        setScrollEventsFired(prev => ({ ...prev, '75': true }));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollEventsFired]);

  // useEffect para ViewContent baseado em timing (EVITAR DUPLICIDADE)
  useEffect(() => {
    // Disparar ViewContent após 15 segundos na página (indica interesse real)
    const viewContentTimer = setTimeout(async () => {
      if (!viewContentFired) {
        await fireViewContentDefinitivo({
          content_name: 'Sistema 4 Fases - Ebook Trips',
          content_ids: ['339591'],
          value: 39.90,
          currency: 'BRL',
          content_type: 'product',
          trigger_type: 'timing',
          time_on_page: 15
        });
        
        setViewContentFired(true);
        console.log('🎯 ViewContent disparado por timing (15s) - Sistema Definitivo');
      }
    }, 15000); // 15 segundos

    // Disparar ViewContent ao atingir 25% de scroll (engajamento inicial)
    const handleScrollForViewContent = async () => {
      if (!viewContentFired) {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPosition = window.scrollY;
        const scrollPercentage = Math.round((scrollPosition / scrollHeight) * 100);

        if (scrollPercentage >= 25) {
          await fireViewContentDefinitivo({
            content_name: 'Sistema 4 Fases - Ebook Trips',
            content_ids: ['339591'],
            value: 39.90,
            currency: 'BRL',
            content_type: 'product',
            trigger_type: 'scroll',
            scroll_depth: 25
          });
          
          setViewContentFired(true);
          console.log('🎯 ViewContent disparado por scroll (25%) - Sistema Definitivo');
          
          // Remover listener após disparar
          window.removeEventListener('scroll', handleScrollForViewContent);
        }
      }
    };

    window.addEventListener('scroll', handleScrollForViewContent);

    return () => {
      clearTimeout(viewContentTimer);
      window.removeEventListener('scroll', handleScrollForViewContent);
    };
  }, [viewContentFired]);

  // Função para abrir o modal de pré-checkout
  const openPreCheckoutModal = (event) => {
    event.preventDefault();
    setIsPreCheckoutModalOpen(true);
  };

  // Função para processar os dados do pré-checkout e redirecionar
  const handlePreCheckoutSubmit = async (formData) => {
    console.log('🚀 Dados recebidos do formulário:', formData);
    
    // Processamento rápido dos dados essenciais
    const cleanFullName = formData.fullName
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '')
      .replace(/^-+|-+$/g, '')
      .replace(/^'+|'+$/g, '');
    
    // Formatação rápida do telefone
    const phoneClean = formData.phone.replace(/\D/g, '');
    
    // Salvar dados PERSISTENTEMENTE (com consentimento implícito ao preencher formulário)
    const userDataToSave = {
      email: formData.email,
      phone: phoneClean,
      fullName: cleanFullName,
      city: formData.city?.trim(),
      state: formData.state?.trim(),
      cep: formData.cep?.replace(/\D/g, '')
    };
    
    saveUserData(userDataToSave, true); // Consentimento verdadeiro ao preencher formulário
    
    // Atualizar estado local
    setUserData(userDataToSave);
    
    console.log('💾 Dados salvos persistentemente:', userDataToSave);
    
    // Capturar apenas parâmetros essenciais para o checkout
    const additionalParams: Record<string, string> = {};
    additionalParams['name'] = cleanFullName;
    additionalParams['email'] = formData.email;
    
    // Formatação rápida do telefone (já existe phoneClean do estado userData)
    if (phoneClean.length >= 10 && phoneClean.length <= 11) {
      const ddd = phoneClean.substring(0, 2);
      const numeroCompleto = phoneClean.substring(2);
      
      if (numeroCompleto.length === 9) {
        const primeiraParte = numeroCompleto.substring(0, 5);
        const segundaParte = numeroCompleto.substring(5);
        additionalParams['phone_number'] = `${ddd} ${primeiraParte}-${segundaParte}`;
      } else if (numeroCompleto.length === 8) {
        const primeiraParte = numeroCompleto.substring(0, 4);
        const segundaParte = numeroCompleto.substring(4);
        additionalParams['phone_number'] = `${ddd} ${primeiraParte}-${segundaParte}`;
      }
    }

    // Adicionar dados de localização se existirem
    if (formData.city?.trim()) additionalParams['city'] = formData.city.trim();
    if (formData.state?.trim()) additionalParams['state'] = formData.state.trim();
    if (formData.cep?.replace(/\D/g, '').length === 8) {
      additionalParams['zip'] = formData.cep.replace(/\D/g, '');
    }

    // Disparar evento Lead com sistema definitivo
    await fireLeadDefinitivo({
      content_name: 'Lead - Formulário Preenchido',
      content_category: 'Formulário',
      value: 15.00,
      currency: 'BRL',
      user_data: {
        em: formData.email,
        ph: phoneClean,
        fn: cleanFullName
      }
    });

    // Disparar evento InitiateCheckout com sistema definitivo
    await fireInitiateCheckoutDefinitivo({
      value: 39.90,
      currency: 'BRL',
      content_name: 'Sistema 4 Fases - Ebook Trips',
      content_ids: ['339591'],
      content_type: 'product',
      user_data: {
        em: formData.email,
        ph: phoneClean,
        fn: cleanFullName,
        // Dados adicionais para enriquecer EQM (se disponíveis)
        ...(formData.city && { ct: formData.city.trim() }),
        ...(formData.state && { st: formData.state.trim() }),
        ...(formData.cep && { zip: formData.cep.replace(/\D/g, '') })
      }
    });

    // Construir URL final rapidamente
    // LINK ATUALIZADO: https://go.allpes.com.br/r1wl4qyyfv (novo link de pagamento)
    const finalUrlString = `https://go.allpes.com.br/r1wl4qyyfv?${new URLSearchParams(additionalParams).toString()}`;
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fechar modal e redirecionar
    setIsPreCheckoutModalOpen(false);
    window.location.href = finalUrlString;
  };

  const scrollToCheckout = async () => {
    // Disparar evento específico de CTA
    await fireCTAClickDefinitivo('Quero Economizar', {
      content_ids: ['339591'],
      value: 39.90,
      currency: 'BRL',
      content_type: 'product',
      cta_type: 'main_checkout_scroll',
      action: 'scroll_to_checkout'
    });
    
    document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' });
  };

  // Função principal de checkout (REDIRECIONAMENTO)
  const handleCheckoutRedirect = async (event) => {
    // Disparar evento específico de CTA final
    await fireCTAClickDefinitivo('Final Checkout', {
      content_ids: ['339591'],
      value: 39.90,
      currency: 'BRL',
      content_type: 'product',
      cta_type: 'final_checkout_modal',
      action: 'open_modal'
    });
    
    // Redirecionar para o novo fluxo com modal
    openPreCheckoutModal(event);
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* Barra de Urgência - Otimizada para Mobile */}
      <div className="bg-red-600 text-white py-2 px-2 sm:px-4 text-center animate-pulse">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold">
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-center">ATENÇÃO: Apenas 47 minutos restantes para garantir o desconto de 87%!</span>
          </div>
          <div className="bg-red-800 px-2 py-1 rounded font-mono text-xs sm:text-sm">
            {String(timeLeft.hours).padStart(2, '0')}:
            {String(timeLeft.minutes).padStart(2, '0')}:
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Hero Section Ultra Otimizada para Mobile */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 py-6 sm:py-8 md:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Badge de Autoridade - Responsivo */}
            <div className="inline-flex items-center gap-1 sm:gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-full font-bold text-xs sm:text-sm mb-4 sm:mb-6">
              <Award className="w-3 h-3 sm:w-4 sm:h-4" />
              MÉTODO VALIDADO PELA EMBRAPA
            </div>

            {/* Headline Ultra Persuasiva - Responsiva */}
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-black mb-3 sm:mb-4 leading-tight">
              <span className="text-red-600">PARE DE JOGAR</span><br />
              <span className="text-gray-800">DINHEIRO FORA</span><br />
              <span className="text-green-600">COM O TRIPS!</span>
            </h1>

            {/* Logo do E-book - Otimizado */}
            <div className="mb-4 sm:mb-6">
              <OptimizedImage 
                src="/ebook-logo.webp" 
                alt="E-book Sistema de Controle de Trips" 
                className="mx-auto max-w-full h-auto rounded-lg shadow-lg"
                style={{ maxWidth: '200px' }}
                priority={true}
                width={200}
                height={200}
                fetchPriority="high"
              />
            </div>

            {/* Sub-headline com Benefício Específico - Responsiva */}
            <p className="text-base sm:text-xl md:text-2xl text-gray-700 mb-4 sm:mb-6 font-semibold px-2">
              Descubra o <span className="text-green-600 font-black">Sistema de 4 Fases</span> que elimina 
              o trips de vez e <span className="text-green-600 font-black">economiza até R$ 5.000 por hectare</span> 
              em defensivos ineficazes
            </p>

            {/* Prova Social Imediata - Responsiva */}
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-lg mb-4 sm:mb-6 inline-block">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  <span className="font-bold">+1.247 produtores</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
                  <span className="font-bold">4.9/5 estrelas</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  <span className="font-bold">94% de sucesso</span>
                </div>
              </div>
            </div>

            {/* CTA Principal Mega Otimizado - Responsivo */}
            <Button 
              onClick={scrollToCheckout}
              className="bg-orange-500 hover:bg-orange-600 text-white font-black py-4 sm:py-6 px-6 sm:px-12 rounded-full text-base sm:text-xl md:text-2xl mb-4 sm:mb-6 transform hover:scale-105 transition-all duration-200 shadow-2xl animate-bounce w-full sm:w-auto"
            >
              <Rocket className="w-4 h-4 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              QUERO ECONOMIZAR R$ 5.000 AGORA!
            </Button>

            {/* Oferta com Desconto Agressivo - Responsiva */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 sm:p-6 rounded-lg shadow-xl">
              <div className="text-xs sm:text-sm font-bold mb-2">🔥 OFERTA RELÂMPAGO - APENAS HOJE!</div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                <div className="text-2xl sm:text-3xl font-black">
                  R$ 39,90
                </div>
                <div className="text-base sm:text-lg line-through opacity-75">
                  R$ 297,00
                </div>
                <div className="bg-yellow-400 text-red-600 px-2 sm:px-3 py-1 rounded-full font-black text-xs sm:text-sm">
                  87% OFF
                </div>
              </div>
              <div className="text-xs sm:text-sm mt-2">💳 Ou 12x de R$ 3,99 sem juros</div>
            </div>
            
  
          </div>
        </div>
      </div>

      {/* Seção de Agitação da Dor - Otimizada para Mobile */}
      <div className="bg-red-50 py-8 sm:py-12 md:py-16 border-t-4 border-red-500">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-4xl mx-auto">
            
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-red-600 mb-3 sm:mb-4 px-2">
                ⚠️ VOCÊ ESTÁ COMETENDO ESTES ERROS CAROS?
              </h2>
              <p className="text-base sm:text-xl text-gray-700 px-2">
                <strong>Cada dia que passa sem o controle correto = R$ 200 a R$ 800 de prejuízo!</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Erro 1 */}
              <div className="bg-white border-l-4 border-red-500 p-4 sm:p-6 rounded-lg shadow-lg">
                <div className="flex items-start gap-2 sm:gap-3">
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">❌ Só ataca quando vê o adulto</h3>
                    <p className="text-gray-600 mb-3 text-xs sm:text-sm">
                      Aplica Delegate, Decarzol, Esperto... mas 48h depois a praga volta PIOR que antes!
                    </p>
                    <div className="bg-red-100 p-2 sm:p-3 rounded text-red-800 font-semibold text-xs sm:text-sm">
                      💸 Prejuízo: R$ 300-600/hectare por aplicação inútil
                    </div>
                  </div>
                </div>
              </div>

              {/* Erro 2 */}
              <div className="bg-white border-l-4 border-red-500 p-4 sm:p-6 rounded-lg shadow-lg">
                <div className="flex items-start gap-2 sm:gap-3">
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">❌ Ignora ovos, ninfas e pupas</h3>
                    <p className="text-gray-600 mb-3 text-xs sm:text-sm">
                      Não quebra o ciclo! A cada 15 dias uma nova geração explode na lavoura.
                    </p>
                    <div className="bg-red-100 p-2 sm:p-3 rounded text-red-800 font-semibold text-xs sm:text-sm">
                      💸 Prejuízo: R$ 2.000-5.000/hectare por safra perdida
                    </div>
                  </div>
                </div>
              </div>

              {/* Erro 3 */}
              <div className="bg-white border-l-4 border-red-500 p-4 sm:p-6 rounded-lg shadow-lg">
                <div className="flex items-start gap-2 sm:gap-3">
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">❌ Copia receita do vizinho</h3>
                    <p className="text-gray-600 mb-3 text-xs sm:text-sm">
                      Cada lavoura é única! O que funciona lá pode ser desastre aqui.
                    </p>
                    <div className="bg-red-100 p-2 sm:p-3 rounded text-red-800 font-semibold text-xs sm:text-sm">
                      💸 Prejuízo: R$ 1.500-3.000/hectare em produtos errados
                    </div>
                  </div>
                </div>
              </div>

              {/* Erro 4 */}
              <div className="bg-white border-l-4 border-red-500 p-4 sm:p-6 rounded-lg shadow-lg">
                <div className="flex items-start gap-2 sm:gap-3">
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">❌ Compra o mais caro na revenda</h3>
                    <p className="text-gray-600 mb-3 text-xs sm:text-sm">
                      Vendedor empurra produto caro sem orientação técnica adequada.
                    </p>
                    <div className="bg-red-100 p-2 sm:p-3 rounded text-red-800 font-semibold text-xs sm:text-sm">
                      💸 Prejuízo: R$ 800-2.000/hectare em produtos superdimensionados
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Consequência Final - Responsiva */}
            <div className="bg-red-600 text-white p-6 sm:p-8 rounded-lg mt-6 sm:mt-8 text-center">
              <h3 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4">🚨 RESULTADO FINAL:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm sm:text-lg font-semibold">
                <div>
                  <div>😰 Travamento das ponteiras</div>
                  <OptimizedImage 
                    src="/travamento-ponteiras.jpg" 
                    alt="Travamento das ponteiras causado por trips" 
                    className="mt-2 sm:mt-3 mx-auto max-w-full h-auto rounded-lg shadow-md"
                    style={{ maxWidth: '200px' }}
                    width={200}
                    height={267}
                    loading="lazy"
                  />
                </div>
                <div>
                  <div>🤢 Frutos deformados e manchados</div>
                  <OptimizedImage 
                    src="/frutos-manchados.jpg" 
                    alt="Frutos deformados e manchados por trips" 
                    className="mt-2 sm:mt-3 mx-auto max-w-full h-auto rounded-lg shadow-md"
                    style={{ maxWidth: '200px' }}
                    width={200}
                    height={267}
                    loading="lazy"
                  />
                </div>
                <div>
                  <div>💀 Viroses que matam a plantação</div>
                  <OptimizedImage 
                    src="/viroses-plantas.jpg" 
                    alt="Viroses que matam as plantas causadas por trips" 
                    className="mt-2 sm:mt-3 mx-auto max-w-full h-auto rounded-lg shadow-md"
                    style={{ maxWidth: '200px' }}
                    width={200}
                    height={267}
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="mt-4 sm:mt-6 text-lg sm:text-xl font-black bg-red-800 p-3 sm:p-4 rounded">
                💸 PREJUÍZO TOTAL: R$ 5.000 a R$ 12.000 POR HECTARE!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção da Solução Revolucionária - Otimizada para Mobile */}
      <div className="bg-gradient-to-br from-green-500 to-green-700 py-8 sm:py-12 md:py-16 text-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-4xl mx-auto text-center">
            
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 px-2">
              🎯 A SOLUÇÃO QUE VAI SALVAR<br />SUA LAVOURA E SEU DINHEIRO!
            </h2>

            <p className="text-base sm:text-xl md:text-2xl mb-6 sm:mb-8 font-semibold px-2">
              O <span className="bg-yellow-400 text-green-800 px-2 sm:px-3 py-1 rounded font-black">SISTEMA 4 FASES</span> 
              que elimina o trips de vez em apenas 28 dias!
            </p>

            <div className="bg-white text-gray-800 p-4 sm:p-8 rounded-lg shadow-2xl mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-black text-green-600 mb-4 sm:mb-6">
                🔬 PROTOCOLO CIENTÍFICO EMBRAPA
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                
                {/* Fase 1 */}
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-green-500 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base">1</div>
                    <h4 className="font-bold text-green-700 text-sm sm:text-base">FASE OVOS (Dias 1-7)</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700">Eliminação dos ovos antes da eclosão com produto ovicida específico</p>
                </div>

                {/* Fase 2 */}
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-blue-500 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base">2</div>
                    <h4 className="font-bold text-blue-700 text-sm sm:text-base">FASE NINFAS (Dias 8-14)</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700">Ataque direcionado às larvas em desenvolvimento com produto sistêmico</p>
                </div>

                {/* Fase 3 */}
                <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border-l-4 border-purple-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-purple-500 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base">3</div>
                    <h4 className="font-bold text-purple-700 text-sm sm:text-base">FASE PUPAS (Dias 15-21)</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700">Controle no solo com produto específico para pupas em transformação</p>
                </div>

                {/* Fase 4 */}
                <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border-l-4 border-orange-500">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-orange-500 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base">4</div>
                    <h4 className="font-bold text-orange-700 text-sm sm:text-base">FASE ADULTOS (Dias 22-28)</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700">Eliminação final dos adultos remanescentes e proteção residual</p>
                </div>
              </div>

              <div className="bg-yellow-100 p-3 sm:p-4 rounded-lg mt-4 sm:mt-6">
                <p className="text-yellow-800 font-bold text-base sm:text-lg">
                  ⚡ RESULTADO: Ciclo do trips QUEBRADO para sempre!
                </p>
              </div>
            </div>

            <Button 
              onClick={scrollToCheckout}
              className="bg-yellow-400 hover:bg-yellow-500 text-green-800 font-black py-4 sm:py-6 px-6 sm:px-12 rounded-full text-base sm:text-xl transform hover:scale-105 transition-all duration-200 shadow-2xl w-full sm:w-auto"
            >
              <Target className="w-4 h-4 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              QUERO O SISTEMA 4 FASES AGORA!
            </Button>
          </div>
        </div>
      </div>

      {/* Seção de Resultados Comprovados - Otimizada para Mobile */}
      <div className="bg-white py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-6xl mx-auto">
            
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-800 mb-3 sm:mb-4 px-2">
                📊 RESULTADOS QUE FALAM POR SI SÓ
              </h2>
              <p className="text-base sm:text-xl text-gray-600 px-2">
                Mais de <strong>1.247 produtores</strong> já transformaram suas lavouras com este método
              </p>
            </div>

            {/* Estatísticas Impactantes - Responsivas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
              
              <div className="text-center bg-green-50 p-3 sm:p-6 rounded-lg border-2 border-green-200">
                <div className="text-2xl sm:text-4xl font-black text-green-600 mb-1 sm:mb-2">94%</div>
                <p className="text-gray-700 font-semibold text-xs sm:text-base">Taxa de Sucesso</p>
              </div>

              <div className="text-center bg-blue-50 p-3 sm:p-6 rounded-lg border-2 border-blue-200">
                <div className="text-2xl sm:text-4xl font-black text-blue-600 mb-1 sm:mb-2">R$ 5k</div>
                <p className="text-gray-700 font-semibold text-xs sm:text-base">Economia Média/Hectare</p>
              </div>

              <div className="text-center bg-purple-50 p-3 sm:p-6 rounded-lg border-2 border-purple-200">
                <div className="text-2xl sm:text-4xl font-black text-purple-600 mb-1 sm:mb-2">28</div>
                <p className="text-gray-700 font-semibold text-xs sm:text-base">Dias para Resultado</p>
              </div>

              <div className="text-center bg-orange-50 p-3 sm:p-6 rounded-lg border-2 border-orange-200">
                <div className="text-2xl sm:text-4xl font-black text-orange-600 mb-1 sm:mb-2">+67%</div>
                <p className="text-gray-700 font-semibold text-xs sm:text-base">Aumento na Produção</p>
              </div>
            </div>

            {/* Depoimentos Ultra Específicos - Responsivos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              
              {/* Depoimento 1 */}
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg border-2 border-green-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                    JM
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm sm:text-base">João Mendes</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">15 hectares - Bahia</p>
                  </div>
                  <div className="flex text-yellow-400 ml-auto">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 italic mb-3 sm:mb-4 text-xs sm:text-sm">
                  "Economizei R$ 3.500 em defensivos! O trips sumiu em 21 dias e não voltou mais. 
                  Minha produção aumentou 89% na safra seguinte."
                </p>
                <div className="bg-green-100 p-2 sm:p-3 rounded text-green-800 font-semibold text-xs sm:text-sm">
                  💰 Economia: R$ 3.500 | 📈 Aumento: 89%
                </div>
              </div>

              {/* Depoimento 2 */}
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg border-2 border-blue-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                    MS
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm sm:text-base">Maria Silva</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">8 hectares - Ceará</p>
                  </div>
                  <div className="flex text-yellow-400 ml-auto">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 italic mb-3 sm:mb-4 text-xs sm:text-sm">
                  "Estava gastando R$ 1.200 por hectare com trips. Agora gasto R$ 180 e tenho 
                  controle total. Lucro líquido subiu R$ 8.160!"
                </p>
                <div className="bg-blue-100 p-2 sm:p-3 rounded text-blue-800 font-semibold text-xs sm:text-sm">
                  💰 Economia mensal: R$ 8.160 | 🎯 Controle: 100%
                </div>
              </div>

              {/* Depoimento 3 */}
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg border-2 border-purple-200">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                    AS
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm sm:text-base">Antônio Santos</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">22 hectares - Pernambuco</p>
                  </div>
                  <div className="flex text-yellow-400 ml-auto">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 italic mb-3 sm:mb-4 text-xs sm:text-sm">
                  "Ia cortar a plantação por causa das viroses. O sistema salvou meu negócio! 
                  Hoje tenho a melhor lavoura da região."
                </p>
                <div className="bg-purple-100 p-2 sm:p-3 rounded text-purple-800 font-semibold text-xs sm:text-sm">
                  🏆 Melhor lavoura da região | 💪 Negócio salvo
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Urgência e Escassez - Otimizada para Mobile */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 py-8 sm:py-12 md:py-16 text-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-4xl mx-auto text-center">
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 sm:mb-6 px-2">
              ⚠️ ATENÇÃO: OFERTA LIMITADA!
            </h2>

            <div className="bg-white text-gray-800 p-4 sm:p-8 rounded-lg shadow-2xl mb-6 sm:mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                
                <div className="text-center">
                  <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-red-600 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold mb-2">APENAS HOJE!</h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Esta oferta especial expira em menos de 1 hora. 
                    Depois volta ao preço normal de R$ 297.
                  </p>
                </div>

                <div className="text-center">
                  <Users className="w-12 h-12 sm:w-16 sm:h-16 text-red-600 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-bold mb-2">ÚLTIMAS VAGAS!</h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Restam apenas 23 vagas para garantir 
                    suporte personalizado via WhatsApp.
                  </p>
                </div>
              </div>

              <div className="bg-red-100 p-3 sm:p-4 rounded-lg mt-4 sm:mt-6">
                <p className="text-red-800 font-bold text-base sm:text-lg">
                  🚨 Cada minuto que passa = R$ 20 de prejuízo na sua lavoura!
                </p>
              </div>
            </div>

            <Button 
              onClick={scrollToCheckout}
              className="bg-yellow-400 hover:bg-yellow-500 text-red-600 font-black py-4 sm:py-6 px-6 sm:px-12 rounded-full text-base sm:text-xl transform hover:scale-105 transition-all duration-200 shadow-2xl animate-pulse w-full sm:w-auto"
            >
              <Zap className="w-4 h-4 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              GARANTIR MINHA VAGA AGORA!
            </Button>
          </div>
        </div>
      </div>

      {/* Seção de Checkout Ultra Otimizada - Sem Formulário */}
      <div id="checkout" className="bg-gray-50 py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-2xl mx-auto">
            
            <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-8 border-4 border-green-500">
              
              <div className="text-center mb-6 sm:mb-8">
                <div className="bg-green-600 text-white p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-black mb-2">🎯 GARANTA SEU ACESSO AGORA!</h2>
                  <p className="text-green-100 text-sm sm:text-base">Transforme sua lavoura em 28 dias ou seu dinheiro de volta!</p>
                </div>

                {/* Oferta Irresistível - Responsiva */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 sm:p-6 rounded-lg mb-4 sm:mb-6">
                  <div className="text-xs sm:text-sm font-bold mb-2">🔥 OFERTA RELÂMPAGO - SÓ HOJE!</div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-2">
                    <div className="text-3xl sm:text-4xl font-black">R$ 39,90</div>
                    <div className="text-lg sm:text-xl line-through opacity-75">R$ 297,00</div>
                    <div className="bg-yellow-400 text-red-600 px-2 sm:px-3 py-1 sm:py-2 rounded-full font-black text-xs sm:text-sm">87% OFF</div>
                  </div>
                  <div className="text-xs sm:text-sm">💳 Ou 12x de R$ 3,99 sem juros no cartão</div>
                </div>

                {/* Bônus Exclusivos - Responsivos */}
                <div className="bg-yellow-50 border-2 border-yellow-400 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
                  <h3 className="font-bold text-yellow-800 mb-2 sm:mb-3 text-sm sm:text-base">🎁 BÔNUS EXCLUSIVOS (Valor: R$ 497)</h3>
                  <div className="text-left space-y-1 sm:space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                      <span>📱 Suporte via WhatsApp por 30 dias</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                      <span>📊 Planilha de controle e monitoramento</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                      <span>🎥 Vídeos práticos de aplicação</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                      <span>📋 Lista de produtos por região</span>
                    </div>
                  </div>
                </div>

                {/* Garantias - Responsivas */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6 text-xs">
                  <div className="flex flex-col items-center gap-1 bg-green-50 p-2 sm:p-3 rounded">
                    <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                    <span className="font-semibold text-center">Garantia 30 Dias</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-blue-50 p-2 sm:p-3 rounded">
                    <Download className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                    <span className="font-semibold text-center">Acesso Imediato</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-purple-50 p-2 sm:p-3 rounded">
                    <Phone className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
                    <span className="font-semibold text-center">Suporte Total</span>
                  </div>
                </div>

                {/* CTA Final - Responsivo */}
                {/* LINK ATUALIZADO: https://go.allpes.com.br/r1wl4qyyfv (novo link de pagamento) */}
                <a 
                  href="https://go.allpes.com.br/r1wl4qyyfv" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  id="botao-compra-allpes" 
                  onClick={handleCheckoutRedirect}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-6 sm:py-8 px-4 sm:px-6 rounded-lg text-xl sm:text-2xl md:text-3xl transform hover:scale-105 transition-all duration-300 shadow-2xl inline-flex items-center justify-center gap-3 sm:gap-4"
                >
                  <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />
                  COMPRAR AGORA
                </a>

                <div className="text-center text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4 space-y-1">
                  <p>🔒 Compra 100% segura e protegida</p>
                  <p>✅ Garantia incondicional de 30 dias</p>
                  <p>⚡ Acesso liberado em até 2 minutos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer com CTA Final - Otimizado para Mobile */}
      <div className="bg-green-800 text-white py-6 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-4xl mx-auto text-center">
            
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 px-2">
              🚀 Não deixe o trips destruir mais um dia da sua lavoura!
            </h3>
            
            <p className="text-green-200 mb-4 sm:mb-6 text-sm sm:text-base px-2">
              Mais de 1.247 produtores já transformaram suas lavouras. 
              <strong>Você será o próximo?</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-green-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold">R$ 39,90</div>
                <div className="text-xs sm:text-sm text-green-200">87% de desconto</div>
              </div>
              
              <Button 
                onClick={scrollToCheckout}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-sm sm:text-lg w-full sm:w-auto"
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                GARANTIR AGORA
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 text-xs sm:text-sm mb-4 sm:mb-6">
              <div>
                <h4 className="font-bold mb-1 sm:mb-2">📞 Contato</h4>
                <p className="text-green-200">maracujalucrativo@gmail.com</p>
              </div>
              <div>
                <h4 className="font-bold mb-1 sm:mb-2">🔒 Segurança</h4>
                <p className="text-green-200">Compra protegida e garantida</p>
              </div>
              <div>
                <h4 className="font-bold mb-1 sm:mb-2">📋 Políticas</h4>
                <p className="text-green-200">Termos • Privacidade • Reembolso</p>
              </div>
            </div>
            
            {/* Ferramentas de Diagnóstico - Apenas para desenvolvimento */}
            <div className="border-t border-green-700 pt-4 mt-4">
              <h4 className="font-bold mb-2 text-green-200">🔧 Ferramentas de Diagnóstico</h4>
              <div className="flex flex-wrap gap-2 justify-center">
                <a 
                  href="/debug" 
                  className="text-green-200 hover:text-white underline text-xs"
                  target="_blank"
                >
                  Debug Dashboard
                </a>
                <span className="text-green-400">•</span>
                <a 
                  href="/trigger-diagnostic" 
                  className="text-green-200 hover:text-white underline text-xs"
                  target="_blank"
                >
                  Trigger Diagnostic
                </a>
                <span className="text-green-400">•</span>
                <a 
                  href="/deep-diagnostic" 
                  className="text-green-200 hover:text-white underline text-xs"
                  target="_blank"
                >
                  Deep Diagnostic
                </a>
                <span className="text-green-400">•</span>
                <a 
                  href="/checkout-test" 
                  className="text-green-200 hover:text-white underline text-xs"
                  target="_blank"
                >
                  Checkout Test
                </a>
                <span className="text-green-400">•</span>
                <a 
                  href="/cookie-diagnostic" 
                  className="text-green-200 hover:text-white underline text-xs"
                  target="_blank"
                >
                  Cookie Diagnostic
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de Pré-Checkout */}
      <PreCheckoutModal
        isOpen={isPreCheckoutModalOpen}
        onClose={() => setIsPreCheckoutModalOpen(false)}
        onSubmit={handlePreCheckoutSubmit}
      />

      {/* Componente de Debug (apenas desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && <DebugPersistence />}
    </div>
  );
}