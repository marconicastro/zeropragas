// 🔄 Componente de Processamento em Tempo Real de URLs
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Activity, 
  Shield, 
  Clock, 
  Copy, 
  ExternalLink,
  Zap,
  Target,
  ShoppingCart,
  Eye
} from 'lucide-react';
import { useUTMsV2 } from '@/hooks/use-utm-v2';
import securityValidator from '@/lib/utm-security-validator';

interface LiveURLProcessorProps {
  url: string;
  title?: string;
}

export default function LiveURLProcessor({ url, title = "Processamento em Tempo Real" }: LiveURLProcessorProps) {
  const { 
    processCheckoutURL, 
    hasCheckoutData,
    hasEcommerceData,
    addToURL,
    toMetaPixelData
  } = useUTMsV2();

  const [processedData, setProcessedData] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessed, setLastProcessed] = useState<Date | null>(null);

  useEffect(() => {
    processURL();
  }, [url]);

  const processURL = async () => {
    setIsProcessing(true);
    
    try {
      // Simular processamento com delay para demonstração
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Processar URL com nosso sistema
      const checkoutData = processCheckoutURL(url);
      setProcessedData(checkoutData);
      
      // Validar segurança
      const validation = securityValidator.validateCheckoutURL(url);
      setValidationResult(validation);
      
      setLastProcessed(new Date());
      
      console.log('🔄 URL Processada em Tempo Real:', {
        url,
        checkoutData,
        validation,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Erro ao processar URL:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const getSecurityColor = (isValid: boolean, riskScore: number) => {
    if (!isValid) return 'destructive';
    if (riskScore < 20) return 'default';
    if (riskScore < 50) return 'secondary';
    return 'destructive';
  };

  const getSecurityText = (isValid: boolean, riskScore: number) => {
    if (!isValid) return 'Crítico';
    if (riskScore < 20) return 'Seguro';
    if (riskScore < 50) return 'Atenção';
    return 'Risco';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>{title}</span>
          </div>
          <div className="flex items-center gap-2">
            {isProcessing ? (
              <div className="flex items-center gap-1 text-sm text-blue-600">
                <Zap className="w-4 h-4 animate-pulse" />
                Processando...
              </div>
            ) : lastProcessed ? (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {formatTimestamp(lastProcessed)}
              </div>
            ) : null}
            <Button
              size="sm"
              variant="outline"
              onClick={processURL}
              disabled={isProcessing}
            >
              <Activity className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* URL Original */}
        <div className="space-y-2">
          <label className="text-sm font-medium">URL Recebida:</label>
          <div className="bg-gray-50 p-3 rounded border">
            <code className="text-xs text-gray-700 break-all">
              {url}
            </code>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(url)}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copiar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(url, '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Testar
              </Button>
            </div>
          </div>
        </div>

        {/* Status de Processamento */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <Badge variant={processedData ? "default" : "secondary"} className="mb-2">
              {processedData ? "Processado" : "Pendente"}
            </Badge>
            <p className="text-xs text-gray-600">Checkout</p>
          </div>
          <div className="text-center">
            <Badge variant={hasEcommerceData ? "default" : "secondary"} className="mb-2">
              {hasEcommerceData ? "Completo" : "Incompleto"}
            </Badge>
            <p className="text-xs text-gray-600">E-commerce</p>
          </div>
          <div className="text-center">
            <Badge 
              variant={getSecurityColor(validationResult?.isValid, validationResult?.riskScore)} 
              className="mb-2"
            >
              {getSecurityText(validationResult?.isValid, validationResult?.riskScore)}
            </Badge>
            <p className="text-xs text-gray-600">Segurança</p>
          </div>
        </div>

        {/* Dados Processados */}
        {processedData && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Dados de Checkout Extraídos
            </h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Session ID:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {processedData.session_id}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Event ID:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    {processedData.event_id}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Product ID:</span>
                  <span className="font-medium">{processedData.product_id}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-medium text-green-600">
                    {processedData.currency} {processedData.value}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Source:</span>
                  <span className="font-medium">{processedData.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Campaign:</span>
                  <span className="font-medium">{processedData.campaign}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validação de Segurança */}
        {validationResult && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Validação de Segurança
            </h4>
            
            <Alert className={validationResult.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CheckCircle className={`w-4 h-4 ${validationResult.isValid ? "text-green-600" : "text-red-600"}`} />
              <AlertDescription className="text-sm">
                <div className="flex justify-between items-center">
                  <span>Status: {validationResult.isValid ? '✅ URL Segura' : '❌ Risco Detectado'}</span>
                  <Badge variant="outline">
                    Risco: {validationResult.riskScore}/100
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>

            {validationResult.errors.length > 0 && (
              <div className="text-xs text-red-600">
                <p className="font-medium mb-1">Erros encontrados:</p>
                <ul className="list-disc list-inside space-y-1">
                  {validationResult.errors.slice(0, 3).map((error: any, index: number) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Meta Pixel Data */}
        {processedData && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              Meta Pixel Data
            </h4>
            <div className="bg-gray-50 p-3 rounded border">
              <pre className="text-xs text-gray-700 overflow-auto max-h-32">
                {JSON.stringify(toMetaPixelData(), null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Timestamp */}
        {lastProcessed && (
          <div className="text-xs text-gray-500 text-center border-t pt-2">
            Última atualização: {lastProcessed.toLocaleString('pt-BR')}
          </div>
        )}
      </CardContent>
    </Card>
  );
}