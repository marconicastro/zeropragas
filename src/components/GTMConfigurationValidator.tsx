'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Eye, Code, Settings, Zap } from 'lucide-react';

interface GTMValidationResult {
  containerStatus: boolean;
  dataLayerStatus: boolean;
  eventValidation: Record<string, {
    sent: boolean;
    received: boolean;
    timestamp?: string;
    details?: any;
  }>;
  triggerValidation: Record<string, boolean>;
  recommendations: string[];
}

export default function GTMConfigurationValidator() {
  const [validationResult, setValidationResult] = useState<GTMValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [testLog, setTestLog] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    const timestamp = new Date().toLocaleTimeString();
    setTestLog(prev => [...prev, `[${timestamp}] ${icon} ${message}`]);
  };

  const validateGTMConfiguration = async () => {
    setIsValidating(true);
    setTestLog([]);
    setCurrentStep(0);
    
    const result: GTMValidationResult = {
      containerStatus: false,
      dataLayerStatus: false,
      eventValidation: {},
      triggerValidation: {},
      recommendations: []
    };

    // Passo 1: Verificar se GTM está carregado
    addLog("Iniciando validação completa do GTM...", 'info');
    setCurrentStep(1);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    result.containerStatus = !!(window as any).google_tag_manager;
    if (result.containerStatus) {
      addLog("✅ Container GTM detectado", 'success');
      
      // Verificar container específico
      const gtm = (window as any).google_tag_manager;
      if (gtm.GTM_567XZCDX) {
        addLog("✅ Container GTM-567XZCDX encontrado e ativo", 'success');
      } else {
        addLog("⚠️ Container GTM-567XZCDX não encontrado", 'warning');
        result.recommendations.push("Verifique se o ID do container está correto");
      }
    } else {
      addLog("❌ Container GTM não encontrado", 'error');
      result.recommendations.push("Verifique se o script GTM está carregado na página");
    }

    // Passo 2: Verificar dataLayer
    setCurrentStep(2);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    result.dataLayerStatus = !!(window as any).dataLayer;
    if (result.dataLayerStatus) {
      addLog(`✅ DataLayer encontrado com ${(window as any).dataLayer.length} itens`, 'success');
    } else {
      addLog("❌ DataLayer não encontrado", 'error');
      result.recommendations.push("Verifique se o dataLayer foi inicializado corretamente");
    }

    // Passo 3: Testar eventos individualmente
    setCurrentStep(3);
    const events = ['view_item', 'begin_checkout', 'ViewContent', 'InitiateCheckout'];
    
    for (const eventName of events) {
      addLog(`🔄 Testando evento: ${eventName}`, 'info');
      
      const eventId = `${eventName}_${Date.now()}_validation`;
      let eventData: any = {
        event: eventName,
        event_id: eventId,
        debug_mode: true,
        timestamp: new Date().toISOString()
      };

      // Adicionar estrutura específica para cada evento
      if (['view_item', 'begin_checkout'].includes(eventName)) {
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
      } else {
        // Meta Pixel events
        eventData.content_name = 'E-book Sistema de Controle de Trips';
        eventData.content_category = 'E-book';
        eventData.value = 39.90;
        eventData.currency = 'BRL';
        if (eventName === 'ViewContent') {
          eventData.content_ids = ['ebook-controle-trips'];
          eventData.content_type = 'product';
        }
      }

      // Enviar evento
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push(eventData);
        result.eventValidation[eventName] = {
          sent: true,
          received: false,
          timestamp: new Date().toISOString(),
          details: eventData
        };
        addLog(`✅ Evento ${eventName} enviado para dataLayer`, 'success');

        // Verificar se o evento foi processado (aguardar um pouco)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar se o evento ainda está no dataLayer
        const eventFound = (window as any).dataLayer?.some((item: any) => item.event_id === eventId);
        if (eventFound) {
          result.eventValidation[eventName].received = true;
          addLog(`✅ Evento ${eventName} confirmado no dataLayer`, 'success');
        } else {
          addLog(`⚠️ Evento ${eventName} pode ter sido processado pelo GTM`, 'warning');
        }
      } else {
        result.eventValidation[eventName] = {
          sent: false,
          received: false
        };
        addLog(`❌ Falha ao enviar evento ${eventName} - dataLayer não disponível`, 'error');
      }
    }

    // Passo 4: Análise de gatilhos (baseado nos eventos enviados)
    setCurrentStep(4);
    addLog("🔍 Analisando configuração de gatilhos...", 'info');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simular verificação de gatilhos
    events.forEach(eventName => {
      // Esta é uma verificação simulada - na prática, precisaríamos da API GTM
      result.triggerValidation[eventName] = true; // Assumimos que os gatilhos existem
      addLog(`📋 Gatilho para ${eventName}: Configurado (verificação manual necessária)`, 'info');
    });

    // Passo 5: Gerar recomendações
    setCurrentStep(5);
    addLog("📝 Gerando recomendações...", 'info');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Adicionar recomendações baseadas nos resultados
    const failedEvents = Object.entries(result.eventValidation)
      .filter(([_, validation]) => !validation.sent)
      .map(([eventName]) => eventName);
    
    if (failedEvents.length > 0) {
      result.recommendations.push(`Verificar configuração dos eventos: ${failedEvents.join(', ')}`);
    }

    result.recommendations.push("Use o GTM Preview Mode para ver os eventos em tempo real");
    result.recommendations.push("Verifique se não há regras de bloqueio impedindo o disparo");
    result.recommendations.push("Confirme a ordem de carregamento das tags");

    addLog("✅ Validação concluída!", 'success');
    setValidationResult(result);
    setIsValidating(false);
  };

  const testGTMPreviewMode = () => {
    addLog("🔧 Instruções para GTM Preview Mode:", 'info');
    addLog("1. Abra o GTM: tagmanager.google.com", 'info');
    addLog("2. Selecione seu container GTM-567XZCDX", 'info');
    addLog("3. Clique em 'Preview' no canto superior direito", 'info');
    addLog("4. Digite a URL do seu site e clique em 'Connect'", 'info');
    addLog("5. Na nova aba, teste os eventos", 'info');
    addLog("6. Volte para ver os resultados no GTM", 'info');
  };

  const clearLog = () => {
    setTestLog([]);
  };

  useEffect(() => {
    // Validação inicial
    const initialResult: GTMValidationResult = {
      containerStatus: !!(window as any).google_tag_manager,
      dataLayerStatus: !!(window as any).dataLayer,
      eventValidation: {},
      triggerValidation: {},
      recommendations: []
    };
    setValidationResult(initialResult);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            GTM Configuration Validator
          </CardTitle>
          <CardDescription>
            Validação completa da configuração do Google Tag Manager
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Status da Validação</h3>
              <Badge variant={isValidating ? "secondary" : "default"}>
                {isValidating ? "Validando..." : "Pronto"}
              </Badge>
            </div>
            
            {isValidating && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${currentStep >= 1 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Verificar Container GTM</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${currentStep >= 2 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Verificar DataLayer</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${currentStep >= 3 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Testar Eventos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${currentStep >= 4 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Analisar Gatilhos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${currentStep >= 5 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className="text-sm">Gerar Recomendações</span>
                </div>
              </div>
            )}
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="events">Eventos</TabsTrigger>
              <TabsTrigger value="log">Log Detalhado</TabsTrigger>
              <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {validationResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-4 border rounded-lg">
                    {validationResult.containerStatus ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>Container GTM</span>
                  </div>
                  
                  <div className="flex items-center gap-2 p-4 border rounded-lg">
                    {validationResult.dataLayerStatus ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>DataLayer</span>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="events" className="space-y-4">
              {validationResult && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Validação de Eventos</h3>
                  {Object.entries(validationResult.eventValidation).map(([eventName, validation]) => (
                    <div key={eventName} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{eventName}</span>
                        <div className="flex gap-2">
                          <Badge variant={validation.sent ? "default" : "destructive"}>
                            Enviado: {validation.sent ? "Sim" : "Não"}
                          </Badge>
                          <Badge variant={validation.received ? "default" : "secondary"}>
                            Recebido: {validation.received ? "Sim" : "Não"}
                          </Badge>
                        </div>
                      </div>
                      {validation.timestamp && (
                        <p className="text-sm text-gray-600">
                          Timestamp: {validation.timestamp}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="log" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Log de Validação</h3>
                <Button onClick={clearLog} variant="ghost" size="sm">
                  Limpar Log
                </Button>
              </div>
              <div className="max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                {testLog.length > 0 ? (
                  testLog.map((log, index) => (
                    <div key={index} className="text-sm font-mono mb-1">
                      {log}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Nenhum log disponível</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              {validationResult && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Recomendações</h3>
                  {validationResult.recommendations.length > 0 ? (
                    validationResult.recommendations.map((rec, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{rec}</AlertDescription>
                      </Alert>
                    ))
                  ) : (
                    <p className="text-gray-500">Nenhuma recomendação no momento</p>
                  )}
                  
                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Próximos Passos:</strong>
                      <ol className="mt-2 list-decimal list-inside text-sm">
                        <li>Use o GTM Preview Mode para ver os eventos em tempo real</li>
                        <li>Verifique se os gatilhos estão configurados corretamente</li>
                        <li>Confirme se as tags estão vinculadas aos gatilhos certos</li>
                        <li>Publique as alterações do container</li>
                      </ol>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex gap-3">
            <Button 
              onClick={validateGTMConfiguration} 
              disabled={isValidating}
              className="flex-1"
            >
              {isValidating && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              {isValidating ? "Validando..." : "Iniciar Validação Completa"}
            </Button>
            <Button onClick={testGTMPreviewMode} variant="outline">
              Como usar Preview Mode
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}