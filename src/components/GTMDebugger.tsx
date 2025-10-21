'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Eye, Code } from 'lucide-react';

interface GTMDebugInfo {
  containerLoaded: boolean;
  dataLayerExists: boolean;
  dataLayerItems: number;
  lastEvents: any[];
  gtmVariables: Record<string, any>;
  tagStatus: Record<string, boolean>;
}

export default function GTMDebugger() {
  const [debugInfo, setDebugInfo] = useState<GTMDebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const checkGTMStatus = () => {
    setIsLoading(true);
    
    const info: GTMDebugInfo = {
      containerLoaded: !!(window as any).google_tag_manager,
      dataLayerExists: !!(window as any).dataLayer,
      dataLayerItems: (window as any).dataLayer?.length || 0,
      lastEvents: (window as any).dataLayer?.slice(-10) || [],
      gtmVariables: {},
      tagStatus: {}
    };

    // Verificar variáveis GTM
    if ((window as any).google_tag_manager?.GTM_567XZCDX) {
      info.gtmVariables = {
        containerId: 'GTM-567XZCDX',
        loaded: true
      };
    }

    // Verificar eventos recentes
    const recentEvents = (window as any).dataLayer?.slice(-10) || [];
    const tagEvents = ['page_view', 'view_item', 'begin_checkout', 'ViewContent', 'InitiateCheckout'];
    
    tagEvents.forEach(eventName => {
      info.tagStatus[eventName] = recentEvents.some(event => event.event === eventName);
    });

    setDebugInfo(info);
    setIsLoading(false);
  };

  const testEvent = (eventType: string) => {
    const eventId = `${eventType}_${Date.now()}_debug`;
    let eventData: any = {
      event: eventType,
      event_id: eventId,
      debug_mode: true,
      timestamp: new Date().toISOString()
    };

    // Adicionar dados específicos para cada tipo de evento
    switch (eventType) {
      case 'page_view':
        eventData.page_title = document.title;
        eventData.page_location = window.location.href;
        eventData.page_referrer = document.referrer;
        break;
      
      case 'view_item':
        eventData.ecommerce = {
          currency: 'BRL',
          value: 39.90,
          items: [{
            item_id: 'ebook-controle-trips',
            item_name: 'E-book Sistema de Controle de Trips',
            category: 'E-book',
            price: 39.90,
            quantity: 1
          }]
        };
        break;
      
      case 'begin_checkout':
        eventData.ecommerce = {
          currency: 'BRL',
          value: 39.90,
          items: [{
            item_id: 'ebook-controle-trips',
            item_name: 'E-book Sistema de Controle de Trips',
            category: 'E-book',
            price: 39.90,
            quantity: 1
          }]
        };
        break;
      
      case 'ViewContent':
        eventData.content_name = 'E-book Sistema de Controle de Trips';
        eventData.content_category = 'E-book';
        eventData.content_ids = ['ebook-controle-trips'];
        eventData.content_type = 'product';
        eventData.value = 39.90;
        eventData.currency = 'BRL';
        break;
      
      case 'InitiateCheckout':
        eventData.content_name = 'E-book Sistema de Controle de Trips';
        eventData.content_category = 'E-book';
        eventData.value = 39.90;
        eventData.currency = 'BRL';
        break;
    }

    // Enviar evento
    if ((window as any).dataLayer) {
      (window as any).dataLayer.push(eventData);
      setTestResults(prev => [...prev, `✅ Evento ${eventType} enviado com ID: ${eventId}`]);
      
      // Verificar se o evento foi adicionado
      setTimeout(() => {
        const eventFound = (window as any).dataLayer?.some((item: any) => item.event_id === eventId);
        if (eventFound) {
          setTestResults(prev => [...prev, `✅ Evento ${eventType} confirmado no dataLayer`]);
        } else {
          setTestResults(prev => [...prev, `❌ Evento ${eventType} NÃO encontrado no dataLayer`]);
        }
      }, 1000);
    } else {
      setTestResults(prev => [...prev, `❌ dataLayer não disponível para enviar evento ${eventType}`]);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const checkTriggers = () => {
    const tips = [
      "1. Verifique se os gatilhos das tags estão configurados para os eventos corretos",
      "2. Confira se as variáveis necessárias estão disponíveis no momento do disparo",
      "3. Verifique a ordem de carregamento das tags (algumas podem depender de outras)",
      "4. Teste com o GTM Preview Mode para ver os eventos em tempo real",
      "5. Verifique se não há regras de bloqueio impedindo o disparo",
      "6. Confirme se os timers/delays das tags estão configurados corretamente"
    ];
    
    setTestResults(prev => [...prev, "📋 Dicas para verificar gatilhos GTM:"]);
    setTestResults(prev => [...prev, ...tips]);
  };

  useEffect(() => {
    checkGTMStatus();
  }, []);

  if (!debugInfo) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            GTM Debugger - Diagnóstico de Tags
          </CardTitle>
          <CardDescription>
            Verifique o status do Google Tag Manager e identifique problemas nas tags
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
              {debugInfo.containerLoaded ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>Container GTM Carregado</span>
            </div>
            
            <div className="flex items-center gap-2">
              {debugInfo.dataLayerExists ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>DataLayer Disponível</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Itens no DataLayer: {debugInfo.dataLayerItems}
              </span>
            </div>
          </div>

          <Tabs defaultValue="status" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="events">Eventos</TabsTrigger>
              <TabsTrigger value="test">Testar</TabsTrigger>
              <TabsTrigger value="debug">Debug</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-4">
              <h3 className="text-lg font-semibold">Status das Tags</h3>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(debugInfo.tagStatus).map(([tag, status]) => (
                  <div key={tag} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{tag}</span>
                    <Badge variant={status ? "default" : "destructive"}>
                      {status ? "Disparando" : "Não Disparando"}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              <h3 className="text-lg font-semibold">Eventos Recentes</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {debugInfo.lastEvents.length > 0 ? (
                  debugInfo.lastEvents.map((event, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(event, null, 2)}
                      </pre>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Nenhum evento encontrado</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <h3 className="text-lg font-semibold">Testar Eventos</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => testEvent('page_view')} variant="outline">
                  Testar page_view
                </Button>
                <Button onClick={() => testEvent('view_item')} variant="outline">
                  Testar view_item
                </Button>
                <Button onClick={() => testEvent('begin_checkout')} variant="outline">
                  Testar begin_checkout
                </Button>
                <Button onClick={() => testEvent('ViewContent')} variant="outline">
                  Testar ViewContent
                </Button>
                <Button onClick={() => testEvent('InitiateCheckout')} variant="outline">
                  Testar InitiateCheckout
                </Button>
                <Button onClick={checkTriggers} variant="secondary">
                  Verificar Gatilhos
                </Button>
              </div>
              
              {testResults.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Resultados do Teste</h4>
                    <Button onClick={clearResults} variant="ghost" size="sm">
                      Limpar
                    </Button>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {testResults.map((result, index) => (
                      <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="debug" className="space-y-4">
              <h3 className="text-lg font-semibold">Informações de Debug</h3>
              <div className="space-y-3">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Problemas Identificados:</strong>
                    <ul className="mt-2 list-disc list-inside text-sm">
                      <li>Tags GA4 (view_item, begin_checkout) não disparando</li>
                      <li>Tags Meta (ViewContent, InitiateCheckout) não disparando</li>
                      <li>Possível problema com gatilhos ou variáveis</li>
                    </ul>
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Code className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Ações Recomendadas:</strong>
                    <ol className="mt-2 list-decimal list-inside text-sm">
                      <li>Verifique se os gatilhos estão configurados para os eventos corretos</li>
                      <li>Confirme se as variáveis ecommerce estão disponíveis</li>
                      <li>Teste no GTM Preview Mode com debug ativo</li>
                      <li>Verifique a ordem de carregamento das tags</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex gap-3">
            <Button onClick={checkGTMStatus} disabled={isLoading}>
              {isLoading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Atualizar Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}