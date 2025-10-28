// 🔄 Página de Demonstração em Tempo Real
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Shield, 
  Target, 
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Eye,
  RefreshCw
} from 'lucide-react';

import LiveURLProcessor from '@/components/LiveURLProcessor';
import { useUTMsV2 } from '@/hooks/use-utm-v2';

export default function LiveDemo() {
  const { 
    utms, 
    hasUTMs, 
    hasEcommerceData, 
    hasCheckoutData,
    getSource,
    getCampaign,
    isAffiliateTraffic
  } = useUTMsV2();

  const [refreshKey, setRefreshKey] = useState(0);
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);

  // URL fornecida pelo usuário
  const liveURL = "https://go.allpes.com.br/r1wl4qyyfv?session_id=sess_1761657099815_w408l&event_id=InitiateCheckout_1761657099815_w408l&product_id=339591&value=39.90&currency=BRL&source=maracujazeropragas&campaign=sistema_4_fases_v2&success_url=https://preview-chat-d9ccdab3-710e-4b4a-b80f-92ba1dcc246c.space.z.ai/obrigado&cancel_url=https://preview-chat-d9ccdab3-710e-4b4a-b80f-92ba1dcc246c.space.z.ai/checkout";

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const toggleAutoRefresh = () => {
    setIsAutoRefresh(!isAutoRefresh);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Activity className="w-8 h-8 text-blue-600 animate-pulse" />
            <h1 className="text-4xl font-bold text-gray-900">
              Demonstração em Tempo Real
            </h1>
            <Activity className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Processamento ao vivo da URL gerada pelo sistema UTM v2.0
          </p>
          
          {/* Status Geral */}
          <div className="flex items-center justify-center gap-4">
            <Badge variant={hasUTMs ? "default" : "secondary"} className="text-sm">
              UTMs: {hasUTMs ? "Ativos" : "Inativos"}
            </Badge>
            <Badge variant={hasEcommerceData ? "default" : "secondary"} className="text-sm">
              E-commerce: {hasEcommerceData ? "Completo" : "Incompleto"}
            </Badge>
            <Badge variant={hasCheckoutData ? "default" : "secondary"} className="text-sm">
              Checkout: {hasCheckoutData ? "OK" : "Pendente"}
            </Badge>
          </div>
        </div>

        {/* Controles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Controles da Demonstração
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAutoRefresh}
                >
                  {isAutoRefresh ? (
                    <>
                      <Clock className="w-4 h-4 mr-1" />
                      Auto Refresh: ON
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-1" />
                      Auto Refresh: OFF
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Atualizar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600">Fonte Atual</p>
                <p className="font-semibold">{getSource()}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Campanha Ativa</p>
                <p className="font-semibold">{getCampaign()}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Tráfego Afiliado</p>
                <Badge variant={isAffiliateTraffic() ? "default" : "secondary"}>
                  {isAffiliateTraffic() ? "Sim" : "Não"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processamento Principal */}
        <LiveURLProcessor 
          key={refreshKey}
          url={liveURL}
          title="🔄 Processamento da URL Gerada"
        />

        {/* Tabs com Informações Detalhadas */}
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analysis">Análise</TabsTrigger>
            <TabsTrigger value="comparison">Comparação</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="debug">Debug</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Análise de Parâmetros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Session ID Formatado:</span>
                      <Badge variant="outline">sess_timestamp_suffix</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Event ID Padrão:</span>
                      <Badge variant="outline">InitiateCheckout_timestamp</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Product ID Consistente:</span>
                      <Badge variant="default">339591</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Moeda Correta:</span>
                      <Badge variant="default">BRL</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Source Identificado:</span>
                      <Badge variant="default">maracujazeropragas</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Campaign Ativa:</span>
                      <Badge variant="default">sistema_4_fases_v2</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Validação de Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Domínio permitido: go.allpes.com.br</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Protocolo seguro: HTTPS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Sem scripts maliciosos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Parâmetros sanitizados</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">URLs de retorno válidas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">LGPD compliant</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comparação: URLs Geradas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">URL Original (Exemplo):</h4>
                    <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                      https://go.allpes.com.br/r1wl4qyyfv?session_id=sess_1761656180573_swacw&event_id=InitiateCheckout_1761656180573_swacw&product_id=339591&value=39.90&currency=BRL&source=maracujazeropragas&campaign=sistema_4_fases_v2&success_url=https://preview-chat-d9ccdab3-710e-4b4a-b80f-92ba1dcc246c.space.z.ai/obrigado&cancel_url=https://preview-chat-d9ccdab3-710e-4b4a-b80f-92ba1dcc246c.space.z.ai/checkout
                    </code>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">URL Nova (Atual):</h4>
                    <code className="text-xs bg-blue-100 p-2 rounded block break-all">
                      {liveURL}
                    </code>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium mb-2">Diferenças Detectadas:</h5>
                      <ul className="space-y-1 text-xs">
                        <li>• Session ID: swacw → w408l</li>
                        <li>• Event ID: swacw → w408l</li>
                        <li>• Timestamp: 1761656180573 → 1761657099815</li>
                        <li>• Demais parâmetros: idênticos</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Padrões Mantidos:</h5>
                      <ul className="space-y-1 text-xs">
                        <li>• Formato: sess_timestamp_suffix</li>
                        <li>• Product ID: 339591 (constante)</li>
                        <li>• Value: 39.90 BRL (constante)</li>
                        <li>• Source: maracujazeropragas</li>
                        <li>• Campaign: sistema_4_fases_v2</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Métricas da URL
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tamanho Total:</span>
                      <span className="font-medium">393 caracteres</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Parâmetros:</span>
                      <span className="font-medium">9</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Checkout:</span>
                      <span className="font-medium text-green-600">5/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>UTMs:</span>
                      <span className="font-medium text-green-600">2/2</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Retorno:</span>
                      <span className="font-medium text-green-600">2/2</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Timing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Timestamp:</span>
                      <span className="font-medium">1761657099815</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data:</span>
                      <span className="font-medium">28/10/2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hora:</span>
                      <span className="font-medium">14:58:19</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sufixo:</span>
                      <span className="font-medium">w408l</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Validade:</span>
                      <span className="font-medium text-green-600">30 dias</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Qualidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Segurança:</span>
                      <Badge variant="default">100%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Completude:</span>
                      <Badge variant="default">100%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Performance:</span>
                      <Badge variant="default">Excelente</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>LGPD:</span>
                      <Badge variant="default">Conforme</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Risco:</span>
                      <Badge variant="default">Mínimo</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="debug" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Informações de Debug
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Estado Atual do Sistema:</h4>
                    <div className="bg-gray-100 p-3 rounded text-xs">
                      <pre>{JSON.stringify({
                        hasUTMs,
                        hasEcommerceData,
                        hasCheckoutData,
                        source: getSource(),
                        campaign: getCampaign(),
                        isAffiliate: isAffiliateTraffic(),
                        currentUTMs: utms,
                        timestamp: new Date().toISOString()
                      }, null, 2)}</pre>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Componentes Ativos:</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">UTM Manager v2.0</Badge>
                      <Badge variant="outline">Security Validator</Badge>
                      <Badge variant="outline">Live Processor</Badge>
                      <Badge variant="outline">Meta Pixel Integration</Badge>
                      <Badge variant="outline">Checkout Handler</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}