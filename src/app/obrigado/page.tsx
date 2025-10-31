/**
 * Página de Obrigado com evento Purchase avançado
 * Dispara evento de compra completa para Meta
 */

'use client';

import { useEffect, useState } from 'react';
import { MetaAdvancedEvents } from '@/lib/meta-advanced-events';
import { CheckCircle, Download, Mail, Phone, Star, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Obrigado() {
  const [purchaseData, setPurchaseData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    // Processar dados da compra
    processPurchaseData();
  }, []);

  const processPurchaseData = async () => {
    try {
      // Recuperar dados da intenção de compra
      const purchaseIntent = localStorage.getItem('userPurchaseIntent');
      const urlParams = new URLSearchParams(window.location.search);
      
      if (purchaseIntent) {
        const intent = JSON.parse(purchaseIntent);
        setPurchaseData(intent);

        // Gerar IDs da transação
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substr(2, 5);
        const orderId = `order_${timestamp}_${randomSuffix}`;
        const transactionId = `txn_${timestamp}_${randomSuffix}`;

        // ✅ PURCHASE JÁ DISPARADO VIA WEBHOOK CAKTO (evita duplicação)
        // O webhook Cakto já dispara Purchase com dados completos quando pagamento é aprovado
        // Esta página apenas exibe confirmação visual para o usuário
        console.log('✅ Purchase disparado via Webhook Cakto (não duplicado)');
        console.log('ℹ️  Esta página apenas exibe mensagem de sucesso');
        console.log('📊 Order ID recuperado:', orderId);
        console.log('💰 Valor:', intent.value || 39.90);
        
        // OPCIONAL: Disparar evento customizado para análise interna (não conta como conversão)
        // await MetaAdvancedEvents.fireCustomEvent('ThankYouPageView', {
        //   order_id: orderId,
        //   value: intent.value || 39.90,
        //   currency: 'BRL'
        // });
        
        // Limpar dados temporários
        localStorage.removeItem('userPurchaseIntent');
      } else {
        // Tentar extrair dados da URL
        const sessionData = {
          session_id: urlParams.get('session_id'),
          event_id: urlParams.get('event_id'),
          product_id: urlParams.get('product_id'),
          value: urlParams.get('value'),
          currency: urlParams.get('currency')
        };

        if (sessionData.session_id) {
          // ✅ PURCHASE JÁ DISPARADO VIA WEBHOOK CAKTO (evita duplicação)
          console.log('✅ Purchase disparado via Webhook Cakto (não duplicado)');
          console.log('ℹ️  Dados da sessão encontrados na URL:', sessionData);
          console.log('📊 Product ID:', sessionData.product_id);
          console.log('💰 Valor:', sessionData.value);
        }
      }
    } catch (error) {
      console.error('Erro ao processar dados da compra:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 font-semibold">Processando sua compra...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Header de Sucesso */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-600 rounded-full mb-4 sm:mb-6">
              <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-green-800 mb-4 sm:mb-6">
              PARABÉNS! COMPRA APROVADA! 🎉
            </h1>
            
            <p className="text-lg sm:text-xl text-green-700 font-semibold">
              Seu acesso ao <span className="bg-yellow-400 text-green-800 px-2 sm:px-3 py-1 rounded font-black">SISTEMA 4 FASES</span> já está liberado!
            </p>
          </div>

          {/* Cards de Informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 sm:mb-12">
            
            {/* Card de Download */}
            <Card className="border-green-200 shadow-lg">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Download className="w-5 h-5" />
                  ACESSO IMEDIATO
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 mb-4">
                  Você receberá um email em <strong>até 5 minutos</strong> com:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Link para download do Ebook
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Vídeos explicativos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Guia de implementação
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Bônus exclusivos
                  </li>
                </ul>
                
                <Button className="w-full mt-6 bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" />
                  Acessar Área de Membros
                </Button>
              </CardContent>
            </Card>

            {/* Card de Suporte */}
            <Card className="border-blue-200 shadow-lg">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Mail className="w-5 h-5" />
                  SUPORTE ESPECIALIZADO
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-gray-700 mb-4">
                  Dúvidas? Estamos aqui para ajudar!
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">suporte@maracujazeropragas.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">(11) 99999-9999</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Horário de atendimento:</strong><br/>
                    Segunda a Sexta: 9h às 18h<br/>
                    Sábado: 9h às 12h
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Próximos Passos */}
          <Card className="border-yellow-200 shadow-lg mb-8">
            <CardHeader className="bg-yellow-50">
              <CardTitle className="text-yellow-700">
                🚀 PRÓXIMOS PASSOS - COMEÇAR AGORA!
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto mb-2">1</div>
                  <h4 className="font-semibold text-gray-800 mb-1">Receba o Email</h4>
                  <p className="text-sm text-gray-600">Verifique sua caixa de entrada e spam</p>
                </div>
                <div className="text-center">
                  <div className="bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto mb-2">2</div>
                  <h4 className="font-semibold text-gray-800 mb-1">Acesse o Conteúdo</h4>
                  <p className="text-sm text-gray-600">Clique no link do email</p>
                </div>
                <div className="text-center">
                  <div className="bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto mb-2">3</div>
                  <h4 className="font-semibold text-gray-800 mb-1">Aplique o Sistema</h4>
                  <p className="text-sm text-gray-600">Siga o passo a passo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Depoimentos */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-800 mb-6">
              O QUE DIZEM NOSSOS CLIENTES
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-green-200">
                  <CardContent className="p-4">
                    <div className="flex mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 italic mb-2">
                      "Sistema mudou completamente minha plantação. Economizei mais de R$ 10.000!"
                    </p>
                    <p className="text-xs text-gray-600 font-semibold">- Cliente {i}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Garantia */}
          <div className="bg-green-600 text-white p-6 sm:p-8 rounded-lg text-center">
            <h3 className="text-xl sm:text-2xl font-black mb-4">
              🛡️ GARANTIA DE 30 DIAS
            </h3>
            <p className="text-base sm:text-lg mb-4">
              Não ficou satisfeito? Devolvemos 100% do seu dinheiro, sem perguntas!
            </p>
            <p className="text-sm opacity-90">
              Risco ZERO para você. Compra 100% SEGURA!
            </p>
          </div>

          {/* Dados da Compra (Debug) */}
          {process.env.NODE_ENV === 'development' && purchaseData && (
            <Card className="mt-8 border-gray-200">
              <CardHeader className="bg-gray-50">
                <CardTitle className="text-gray-700 text-sm">
                  📊 Dados da Compra (Debug)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <pre className="text-xs text-gray-600 overflow-x-auto">
                  {JSON.stringify(purchaseData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}