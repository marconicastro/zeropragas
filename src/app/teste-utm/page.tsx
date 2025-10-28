// 🧪 Página de Teste Completa do Sistema UTM v2.0
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Copy, 
  Shield, 
  ShoppingCart,
  Target,
  TrendingUp,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

import { useUTMsV2 } from '@/hooks/use-utm-v2';
import CheckoutURLProcessor from '@/components/CheckoutURLProcessor';
import DebugUTM from '@/components/DebugUTM';
import securityValidator from '@/lib/utm-security-validator';

export default function TesteUTM() {
  const { 
    utms, 
    primaryUTMs, 
    ecommerceData, 
    checkoutData, 
    hasUTMs, 
    hasEcommerceData, 
    hasCheckoutData,
    processCheckoutURL,
    addToURL,
    toMetaPixelData,
    exportData,
    getSource,
    getCampaign,
    isAffiliateTraffic
  } = useUTMsV2();

  const [showDebug, setShowDebug] = useState(false);
  const [testURL, setTestURL] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // URL de teste (a que você forneceu)
  const exampleURL = "https://go.allpes.com.br/r1wl4qyyfv?session_id=sess_1761656180573_swacw&event_id=InitiateCheckout_1761656180573_swacw&product_id=339591&value=39.90&currency=BRL&source=maracujazeropragas&campaign=sistema_4_fases_v2&success_url=https://preview-chat-d9ccdab3-710e-4b4a-b80f-92ba1dcc246c.space.z.ai/obrigado&cancel_url=https://preview-chat-d9ccdab3-710e-4b4a-b80f-92ba1dcc246c.space.z.ai/checkout";

  useEffect(() => {
    // Carregar URL de exemplo ao montar
    setTestURL(exampleURL);
    validateURL(exampleURL);
  }, []);

  const validateURL = (url: string) => {
    const result = securityValidator.validateCheckoutURL(url);
    setValidationResult(result);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportFullReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      system: 'UTM Manager v2.0',
      url: testURL,
      utm_data: {
        all: utms,
        primary: primaryUTMs,
        ecommerce: ecommerceData,
        has_utms: hasUTMs,
        has_ecommerce: hasEcommerceData,
        has_checkout: hasCheckoutData
      },
      checkout_data: checkoutData,
      security_validation: validationResult,
      meta_pixel_data: toMetaPixelData(),
      analysis: {
        source: getSource(),
        campaign: getCampaign(),
        is_affiliate: isAffiliateTraffic()
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utm-test-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            🎯 Teste do Sistema UTM v2.0
          </h1>
          <p className="text-gray-600">
            Sistema completo de gerenciamento UTM com suporte para e-commerce e validação de segurança
          </p>
        </div>

        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Status do Sistema
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDebug(!showDebug)}
                >
                  {showDebug ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  Debug
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportFullReport}
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Badge variant={hasUTMs ? "default" : "secondary"} className="mb-2">
                  {hasUTMs ? "Ativos" : "Inativos"}
                </Badge>
                <p className="text-sm text-gray-600">UTMs</p>
              </div>
              <div className="text-center">
                <Badge variant={hasEcommerceData ? "default" : "secondary"} className="mb-2">
                  {hasEcommerceData ? "Sim" : "Não"}
                </Badge>
                <p className="text-sm text-gray-600">E-commerce</p>
              </div>
              <div className="text-center">
                <Badge variant={hasCheckoutData ? "default" : "secondary"} className="mb-2">
                  {hasCheckoutData ? "Completo" : "Incompleto"}
                </Badge>
                <p className="text-sm text-gray-600">Checkout</p>
              </div>
              <div className="text-center">
                <Badge variant={validationResult?.isValid ? "default" : "destructive"} className="mb-2">
                  {validationResult?.isValid ? "Seguro" : "Risco"}
                </Badge>
                <p className="text-sm text-gray-600">Segurança</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="checkout">Checkout</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
          </TabsList>

          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* UTMs Capturados */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">UTMs Capturados</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasUTMs ? (
                    <div className="space-y-2">
                      {Object.entries(utms).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="font-mono text-sm">{key}:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{value}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(value)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Nenhum UTM detectado</p>
                  )}
                </CardContent>
              </Card>

              {/* Dados de E-commerce */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dados E-commerce</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasEcommerceData ? (
                    <div className="space-y-2">
                      {Object.entries(ecommerceData).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="font-mono text-sm">{key}:</span>
                          <span className="text-sm font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Nenhum dado de e-commerce</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Análise */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Análise de Tráfego
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Fonte</p>
                    <p className="font-semibold">{getSource()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Campanha</p>
                    <p className="font-semibold">{getCampaign()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Tráfego Afiliado</p>
                    <Badge variant={isAffiliateTraffic() ? "default" : "secondary"}>
                      {isAffiliateTraffic() ? "Sim" : "Não"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Checkout */}
          <TabsContent value="checkout" className="space-y-4">
            <CheckoutURLProcessor 
              onCheckoutData={(data) => console.log('Checkout data:', data)}
              showDebug={showDebug}
            />
          </TabsContent>

          {/* Tab: Segurança */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Validação de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL para validar:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testURL}
                      onChange={(e) => {
                        setTestURL(e.target.value);
                        validateURL(e.target.value);
                      }}
                      className="flex-1 p-2 border rounded text-sm"
                      placeholder="Cole a URL aqui..."
                    />
                    <Button onClick={() => validateURL(testURL)}>
                      Validar
                    </Button>
                  </div>
                </div>

                {validationResult && (
                  <div className="space-y-3">
                    <Alert className={validationResult.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                      <div className="flex items-center gap-2">
                        {validationResult.isValid ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        <AlertDescription>
                          Status: {validationResult.isValid ? '✅ Seguro' : '❌ Risco Detectado'}
                        </AlertDescription>
                      </div>
                    </Alert>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Estatísticas:</h4>
                        <div className="space-y-1 text-sm">
                          <p>Pontuação de Risco: {validationResult.riskScore}/100</p>
                          <p>Erros: {validationResult.errors.length}</p>
                          <p>Avisos: {validationResult.warnings.length}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Dados Sanitizados:</h4>
                        <div className="max-h-32 overflow-y-auto">
                          <pre className="text-xs bg-gray-100 p-2 rounded">
                            {JSON.stringify(validationResult.sanitizedData, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>

                    {validationResult.errors.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 text-red-600">Erros:</h4>
                        <div className="space-y-2">
                          {validationResult.errors.map((error: any, index: number) => (
                            <Alert key={index} className="border-red-200 bg-red-50">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <AlertDescription className="text-sm">
                                <strong>{error.field}:</strong> {error.message}
                                <br />
                                <span className="text-xs">Severidade: {error.severity}</span>
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Avançado */}
          <TabsContent value="advanced" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Meta Pixel Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Meta Pixel Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                    {JSON.stringify(toMetaPixelData(), null, 2)}
                  </pre>
                </CardContent>
              </Card>

              {/* Export Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dados Completos</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                    {JSON.stringify(JSON.parse(exportData()), null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Debug Components */}
        {showDebug && (
          <div className="space-y-4">
            <DebugUTM visible={true} />
          </div>
        )}
      </div>
    </div>
  );
}