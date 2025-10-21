'use client';

import { useState } from 'react';
import GTMDebugger from '@/components/GTMDebugger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bug, Settings, ExternalLink } from 'lucide-react';

export default function DiagnosticPage() {
  const [showDebugger, setShowDebugger] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Centro de Diagnóstico GTM
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ferramenta completa para diagnosticar e corrigir problemas de disparo de tags no Google Tag Manager
          </p>
        </div>

        {/* Problemas Identificados */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Problemas Identificados no seu GTM
            </CardTitle>
            <CardDescription>
              Baseado no seu relatório GTM Assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">✅ Tags Funcionando:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• GA4 Configuration</li>
                  <li>• Meta Pixel Base</li>
                  <li>• GTM Server - page_view</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-red-700">❌ Tags Não Disparando:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• GA4 - view_item</li>
                  <li>• GA4 - begin_checkout</li>
                  <li>• Meta - ViewContent</li>
                  <li>• Meta - InitiateCheckout</li>
                  <li>• GTM Server - view_content</li>
                  <li>• GTM Server - initiate_checkout</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Causas Prováveis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Causas Prováveis dos Problemas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold">1. Problemas com Gatilhos</h4>
                <p className="text-sm text-gray-600">
                  Os gatilhos das tags podem não estar configurados para reconhecer os eventos corretos. 
                  Verifique se os gatilhos estão esperando pelos eventos certos (view_item, begin_checkout, etc.).
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">2. Variáveis Ausentes</h4>
                <p className="text-sm text-gray-600">
                  Tags de e-commerce precisam de variáveis específicas (ecommerce.items, value, currency). 
                  Se essas variáveis não estiverem disponíveis, as tags não disparam.
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">3. Ordem de Carregamento</h4>
                <p className="text-sm text-gray-600">
                  Algumas tags dependem de outras para funcionar. Verifique se a ordem de execução está correta.
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">4. Timing dos Eventos</h4>
                <p className="text-sm text-gray-600">
                  Os eventos podem estar sendo disparados antes que as tags estejam prontas. 
                  Considere adicionar delays ou verificar o timing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Soluções */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Soluções Recomendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Solução 1: Verificar Gatilhos no GTM</h4>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Acesse seu container GTM-567XZCDX</li>
                  <li>Vá para "Gatilhos" e verifique se existem gatilhos para os eventos</li>
                  <li>Confirme se os gatilhos estão configurados para "Evento Personalizado"</li>
                  <li>Verifique se o nome do evento corresponde exatamente (view_item, begin_checkout, etc.)</li>
                </ol>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Solução 2: Adicionar Variáveis E-commerce</h4>
                <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                  <li>Em "Variáveis", crie variáveis de Camada de Dados para ecommerce</li>
                  <li>Configure as variáveis: ecommerce.value, ecommerce.currency, ecommerce.items</li>
                  <li>Verifique se as tags estão usando essas variáveis corretamente</li>
                </ol>
              </div>
              
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Solução 3: Usar GTM Preview Mode</h4>
                <ol className="text-sm text-purple-700 space-y-1 list-decimal list-inside">
                  <li>Abra o GTM Preview Mode</li>
                  <li>Navegue pelo seu site e observe os eventos na aba Debug</li>
                  <li>Verifique se os eventos aparecem no dataLayer</li>
                  <li>Veja se as tags são acionadas quando os eventos ocorrem</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ação Principal */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="text-center">
              Ação Imediata Recomendada
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Use nossa ferramenta de diagnóstico interativa para testar os eventos em tempo real
              e identificar exatamente o que está impedindo o disparo das tags.
            </p>
            <Button 
              size="lg" 
              onClick={() => setShowDebugger(!showDebugger)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {showDebugger ? 'Ocultar' : 'Abrir'} Ferramenta de Diagnóstico
            </Button>
          </CardContent>
        </Card>

        {/* Links Úteis */}
        <Card>
          <CardHeader>
            <CardTitle>Links Úteis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a 
                href="https://tagassistant.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4" />
                Google Tag Assistant
              </a>
              <a 
                href="https://tagmanager.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4" />
                Google Tag Manager
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Debugger Component */}
        {showDebugger && (
          <div className="mt-8">
            <GTMDebugger />
          </div>
        )}
      </div>
    </div>
  );
}