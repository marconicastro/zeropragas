'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MetaEventTracker, useMetaEventTracker } from '@/components/meta-event-tracker';
import { CheckCircle, XCircle, Clock, Database, Globe, Smartphone } from 'lucide-react';

export default function EventUnificationDemo() {
  const [sessionId, setSessionId] = useState('');
  const [initiateData, setInitiateData] = useState<any>(null);
  const [purchaseData, setPurchaseData] = useState<any>(null);
  const [unifiedData, setUnifiedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { trackInitiateCheckout, trackPurchase, getSessionId } = useMetaEventTracker();

  useEffect(() => {
    const currentSessionId = getSessionId();
    if (currentSessionId) {
      setSessionId(currentSessionId);
    }
  }, [getSessionId]);

  // 模拟 InitiateCheckout 事件
  const handleInitiateCheckout = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const mockInitiateData = {
        value: 39.9,
        currency: 'BRL',
        content_ids: ['hacr962'],
        content_name: 'Sistema 4 Fases - Ebook Trips',
        content_category: 'digital_product',
        user_data: {
          email: 'cliente@exemplo.com',
          phone: '+5511999998888',
          firstName: 'João',
          lastName: 'Silva',
          city: 'São Paulo',
          state: 'SP',
          zipcode: '01234567',
          country: 'BR'
        },
        custom_data: {
          checkout_step: 1,
          payment_method_available: ['credit_card', 'pix'],
          num_items: 1,
          delivery_type: 'digital_download',
          order_type: 'online_purchase',
          product_category: 'digital_guide',
          user_engagement_time: 23,
          form_completion_time: 30,
          checkout_type: 'modal_redirect'
        }
      };

      const result = await trackInitiateCheckout(mockInitiateData);
      setInitiateData(mockInitiateData);
      setSuccess('✅ InitiateCheckout enviado com sucesso!');
      
      // 获取 o session ID retornado
      const newSessionId = getSessionId();
      if (newSessionId) {
        setSessionId(newSessionId);
      }
      
    } catch (err: any) {
      setError(`❌ Erro ao enviar InitiateCheckout: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 模拟 Purchase 事件
  const handlePurchase = async () => {
    if (!sessionId) {
      setError('❌ É necessário enviar o InitiateCheckout primeiro');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const mockPurchaseData = {
        value: 39.9,
        currency: 'BRL',
        content_ids: ['hacr962'],
        transaction_id: `test_base_${Date.now()}`,
        payment_method: 'pix',
        content_name: 'Sistema 4 Fases',
        content_category: 'digital_product',
        num_items: 1,
        user_data: {
          email: 'cliente@exemplo.com',
          phone: '+5511999998888',
          firstName: 'João',
          lastName: 'Silva'
        },
        custom_data: {
          purchase_completed: true,
          payment_confirmed: true
        }
      };

      const result = await trackPurchase(mockPurchaseData);
      setPurchaseData(mockPurchaseData);
      setSuccess('✅ Purchase enviado com sucesso! Dados unificados.');
      
    } catch (err: any) {
      setError(`❌ Erro ao enviar Purchase: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 获取 informações da sessão
  const fetchSessionInfo = async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`/api/events/unify?sessionId=${sessionId}`);
      const data = await response.json();
      
      if (data.success && data.session.unifiedEventData) {
        setUnifiedData(JSON.parse(data.session.unifiedEventData));
      }
    } catch (err: any) {
      console.error('Erro ao buscar informações da sessão:', err);
    }
  };

  useEffect(() => {
    if (sessionId && purchaseData) {
      fetchSessionInfo();
    }
  }, [sessionId, purchaseData]);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Demonstração: Unificação de Eventos Meta</h1>
        <p className="text-muted-foreground">
          Solução para unificar dados do InitiateCheckout com Purchase, enviando informações completas para a Meta Conversions API
        </p>
      </div>

      <MetaEventTracker />

      {/* Status e Alertas */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Session Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Informações da Sessão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Session ID</Label>
              <p className="text-sm text-muted-foreground font-mono break-all">
                {sessionId || 'Não iniciado'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status InitiateCheckout</Label>
              <div className="flex items-center gap-2 mt-1">
                {initiateData ? (
                  <><CheckCircle className="h-4 w-4 text-green-600" /><span className="text-sm text-green-600">Enviado</span></>
                ) : (
                  <><XCircle className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-500">Pendente</span></>
                )}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Status Purchase</Label>
              <div className="flex items-center gap-2 mt-1">
                {purchaseData ? (
                  <><CheckCircle className="h-4 w-4 text-green-600" /><span className="text-sm text-green-600">Enviado</span></>
                ) : (
                  <><XCircle className="h-4 w-4 text-gray-400" /><span className="text-sm text-gray-500">Pendente</span></>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ações de Teste</CardTitle>
          <CardDescription>
            Simule o fluxo completo de checkout para testar a unificação de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={handleInitiateCheckout}
              disabled={loading || !!initiateData}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              1. Enviar InitiateCheckout
            </Button>
            <Button 
              onClick={handlePurchase}
              disabled={loading || !sessionId || !!purchaseData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              2. Enviar Purchase
            </Button>
            <Button 
              onClick={() => {
                setInitiateData(null);
                setPurchaseData(null);
                setUnifiedData(null);
                setSessionId('');
                setSuccess('');
                setError('');
              }}
              variant="destructive"
              disabled={loading}
            >
              Resetar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dados Detalhados */}
      <Tabs defaultValue="initiate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="initiate">InitiateCheckout</TabsTrigger>
          <TabsTrigger value="purchase">Purchase</TabsTrigger>
          <TabsTrigger value="unified">Dados Unificados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="initiate" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Dados do InitiateCheckout
                {initiateData && <Badge variant="secondary">Completo</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {initiateData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Valor</Label>
                      <p className="text-sm">R$ {initiateData.value}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Moeda</Label>
                      <p className="text-sm">{initiateData.currency}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Produto</Label>
                      <p className="text-sm">{initiateData.content_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Categoria</Label>
                      <p className="text-sm">{initiateData.content_category}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Dados do Usuário</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(initiateData.user_data, null, 2)}</pre>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Dados Personalizados</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm max-h-48 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(initiateData.custom_data, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum dado enviado ainda</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="purchase" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Dados do Purchase
                {purchaseData && <Badge variant="secondary">Recebido</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {purchaseData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Valor</Label>
                      <p className="text-sm">R$ {purchaseData.value}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Transaction ID</Label>
                      <p className="text-sm font-mono">{purchaseData.transaction_id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Método Pagamento</Label>
                      <p className="text-sm uppercase">{purchaseData.payment_method}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Itens</Label>
                      <p className="text-sm">{purchaseData.num_items}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Dados Completos</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm max-h-48 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(purchaseData, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum dado enviado ainda</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="unified" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Dados Unificados (Enviados para Meta)
                {unifiedData && <Badge className="bg-green-600">✓ Unificado</Badge>}
              </CardTitle>
              <CardDescription>
                Dados completos combinando InitiateCheckout + Purchase
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unifiedData ? (
                <div className="space-y-4">
                  <Alert className="border-blue-200 bg-blue-50">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Tempo para compra:</strong> {Math.round(unifiedData.time_to_purchase / 1000)} segundos
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Evento Final</Label>
                      <p className="text-sm font-semibold">{unifiedData.eventName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Valor Total</Label>
                      <p className="text-sm">R$ {unifiedData.value}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Dispositivo</Label>
                      <p className="text-sm">{unifiedData.device_type} - {unifiedData.browser}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Dados Herdados do InitiateCheckout</Label>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div><strong>UTM Campaign:</strong> {unifiedData.campaign_name || 'N/A'}</div>
                      <div><strong>Resolution:</strong> {unifiedData.screen_width}x{unifiedData.screen_height}</div>
                      <div><strong>Language:</strong> {unifiedData.language}</div>
                      <div><strong>Timezone:</strong> {unifiedData.timezone}</div>
                      <div><strong>Page Load Time:</strong> {unifiedData.page_load_time}ms</div>
                      <div><strong>User Journey Stage:</strong> {unifiedData.user_journey_stage}</div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">JSON Completo</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded text-xs max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(unifiedData, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Aguardando envio dos eventos InitiateCheckout e Purchase para gerar dados unificados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}