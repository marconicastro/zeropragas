/**
 * PÁGINA DE TESTE - META PIXEL UNIFIED V2
 * 
 * Testa todas as melhorias implementadas:
 * 1. ✅ Deduplicação completa
 * 2. ✅ Dados geográficos 100%
 * 3. ✅ Persistência entre eventos
 * 4. ✅ PageView melhorado
 * 5. ✅ Lead/Checkout corrigidos
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TestUnifiedV2Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastEvent, setLastEvent] = useState<string>('');
  const [eventResults, setEventResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventResults(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const handleFireAllEvents = async () => {
    setIsLoading(true);
    setLastEvent('Todos os eventos');
    addResult('🚀 Iniciando todos os eventos Unified V2...');
    
    try {
      // Importa dinamicamente para evitar SSR
      const { fireAllUnifiedEventsV2 } = await import('@/lib/meta-pixel-unified-v2');
      await fireAllUnifiedEventsV2();
      addResult('✅ Todos os eventos disparados com sucesso!');
    } catch (error) {
      addResult(`❌ Erro: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeSystem = () => {
    setLastEvent('Análise do Sistema');
    addResult('🔍 Analisando sistema completo...');
    
    // Importa dinamicamente
    import('@/lib/meta-pixel-unified-v2').then(({ analyzeMetaSystemV2 }) => {
      analyzeMetaSystemV2();
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">
            Meta Pixel Unified V2
          </h1>
          <p className="text-lg text-slate-600">
            Sistema Completo de Deduplicação e Persistência de Dados
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="default" className="bg-green-600">Deduplicação Completa</Badge>
            <Badge variant="default" className="bg-blue-600">Dados Geográficos 100%</Badge>
            <Badge variant="default" className="bg-purple-600">Persistência Entre Eventos</Badge>
            <Badge variant="default" className="bg-orange-600">PageView Melhorado</Badge>
          </div>
        </div>

        {/* Alerta Informativo */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-800">
            <strong>🎯 OBJETIVO:</strong> Todos os eventos devem atingir 8.5+ de qualidade, 
            com PageViewEnriched mantendo 9.3/10. Abra o console para ver logs detalhados.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todos Eventos</TabsTrigger>
            <TabsTrigger value="improvements">Melhorias</TabsTrigger>
            <TabsTrigger value="analysis">Análise</TabsTrigger>
          </TabsList>

          {/* Tab 1: Todos os Eventos */}
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🚀 Disparar Todos os Eventos
                  {lastEvent === 'Todos os eventos' && (
                    <Badge variant="secondary">Executado</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Executa a sequência completa de eventos com todas as melhorias implementadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">✅ Melhorias Implementadas:</h4>
                    <ul className="text-sm space-y-1 text-slate-700">
                      <li>• Deduplicação completa (event_id, event_time, action_source)</li>
                      <li>• Dados geográficos 100% (API + Persistência)</li>
                      <li>• Persistência entre eventos</li>
                      <li>• PageView melhorado (7.8 → 8.5+)</li>
                      <li>• Lead/Checkout corrigidos (60% → 90%+)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">📈 Resultado Esperado:</h4>
                    <ul className="text-sm space-y-1 text-slate-700">
                      <li>• PageView: 7.8 → 8.5+</li>
                      <li>• ViewContent: 8.3 → 8.8+</li>
                      <li>• ScrollDepth: 8.5 → 8.8+</li>
                      <li>• CTAClick: 8.6 → 9.0+</li>
                      <li>• Lead: 9.1 → 9.3+</li>
                      <li>• InitiateCheckout: 9.1 → 9.3+</li>
                    </ul>
                  </div>
                </div>
                
                <Button 
                  onClick={handleFireAllEvents}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? 'Disparando Eventos...' : '🚀 Disparar Todos os Eventos V2'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Melhorias */}
          <TabsContent value="improvements" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">🔒 Deduplicação Completa</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li>✅ event_id único para cada evento</li>
                    <li>✅ event_time Unix timestamp</li>
                    <li>✅ action_source (browser/server)</li>
                    <li>✅ Chaves correspondentes browser/server</li>
                    <li>✅ Meta-parâmetros de correspondência</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-700">🌍 Dados Geográficos 100%</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li>✅ API geolocalização automática</li>
                    <li>✅ Dados persistidos (formulário)</li>
                    <li>✅ Fallback inteligente</li>
                    <li>✅ Cover para Lead/Checkout (60%→90%+)</li>
                    <li>✅ Padronização para todos eventos</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-700">💾 Persistência Entre Eventos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li>✅ Dados coletados em ViewContent persistem</li>
                    <li>✅ ScrollDepth coleta durante navegação</li>
                    <li>✅ CTAClick captura engajamento</li>
                    <li>✅ Progressão de qualidade entre eventos</li>
                    <li>✅ Análise de eficiência</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-700">📄 PageView Melhorado</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2">
                    <li>✅ Dados geográficos completos</li>
                    <li>✅ Sistema unificado de dados</li>
                    <li>✅ Mesma lógica do PageViewEnriched</li>
                    <li>✅ Melhoria: 7.8 → 8.5+</li>
                    <li>✅ Mantido sem substituição</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 3: Análise */}
          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>📊 Análise do Sistema</CardTitle>
                <CardDescription>
                  Verifique a eficiência da deduplicação e persistência de dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleAnalyzeSystem}
                  className="w-full"
                  variant="secondary"
                >
                  🔍 Analisar Sistema Completo
                </Button>
                
                <div className="text-sm text-slate-600 space-y-2">
                  <p><strong>Como verificar os resultados:</strong></p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Abra o console do navegador (F12)</li>
                    <li>Execute os eventos e observe os logs</li>
                    <li>Verifique as chaves de deduplicação</li>
                    <li>Confirme a persistência de dados</li>
                    <li>Aguarde 24-48h para ver resultados no Meta Events Manager</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Log de Resultados */}
            <Card>
              <CardHeader>
                <CardTitle>📋 Log de Eventos</CardTitle>
                <CardDescription>Últimas ações executadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
                  {eventResults.length > 0 ? (
                    eventResults.map((result, index) => (
                      <div key={index} className="mb-1">
                        {result}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500">Nenhum evento executado ainda...</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500 pt-6">
          <p>Meta Pixel Unified V2 - Sistema completo de deduplicação e persistência</p>
          <p>Abra o console para ver logs detalhados de cada evento</p>
        </div>
      </div>
    </div>
  );
}