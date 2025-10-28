// 🛒 Componente para processar e validar URLs de checkout
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Copy, ExternalLink, Shield, ShoppingCart } from 'lucide-react';
import { useUTMsV2 } from '@/hooks/use-utm-v2';

interface CheckoutURLProcessorProps {
  onCheckoutData?: (data: any) => void;
  showDebug?: boolean;
}

export default function CheckoutURLProcessor({ onCheckoutData, showDebug = false }: CheckoutURLProcessorProps) {
  const { 
    processCheckoutURL, 
    checkoutData, 
    hasCheckoutData,
    hasEcommerceData,
    ecommerceData,
    primaryUTMs,
    addToURL,
    exportData
  } = useUTMsV2();

  const [inputURL, setInputURL] = useState('');
  const [processedData, setProcessedData] = useState<any>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState('');

  // URL de exemplo (a que você forneceu)
  const exampleURL = "https://go.allpes.com.br/r1wl4qyyfv?session_id=sess_1761656180573_swacw&event_id=InitiateCheckout_1761656180573_swacw&product_id=339591&value=39.90&currency=BRL&source=maracujazeropragas&campaign=sistema_4_fases_v2&success_url=https://preview-chat-d9ccdab3-710e-4b4a-b80f-92ba1dcc246c.space.z.ai/obrigado&cancel_url=https://preview-chat-d9ccdab3-710e-4b4a-b80f-92ba1dcc246c.space.z.ai/checkout";

  useEffect(() => {
    // Processar URL atual se houver dados de checkout
    if (hasCheckoutData && checkoutData) {
      setProcessedData(checkoutData);
      setIsValid(true);
      setValidationMessage('URL de checkout atual válida e processada');
      onCheckoutData?.(checkoutData);
    }
  }, [checkoutData, hasCheckoutData, onCheckoutData]);

  const processURL = () => {
    if (!inputURL.trim()) {
      setIsValid(false);
      setValidationMessage('Por favor, insira uma URL');
      return;
    }

    try {
      // Validar formato da URL
      new URL(inputURL);
      
      // Processar URL com nosso sistema
      const data = processCheckoutURL(inputURL);
      
      if (data) {
        setProcessedData(data);
        setIsValid(true);
        setValidationMessage('URL de checkout processada com sucesso!');
        onCheckoutData?.(data);
      } else {
        setProcessedData(null);
        setIsValid(false);
        setValidationMessage('URL não contém todos os parâmetros obrigatórios de checkout');
      }
    } catch (error) {
      setProcessedData(null);
      setIsValid(false);
      setValidationMessage('URL inválida');
    }
  };

  const loadExample = () => {
    setInputURL(exampleURL);
    setTimeout(() => processURL(), 100);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateSecureURL = () => {
    if (!processedData) return '';
    
    const baseURL = "https://go.allpes.com.br/r1wl4qyyfv";
    const secureParams = {
      session_id: processedData.session_id,
      event_id: processedData.event_id,
      product_id: processedData.product_id,
      value: processedData.value,
      currency: processedData.currency,
      source: processedData.source,
      campaign: processedData.campaign
    };
    
    const url = new URL(baseURL);
    Object.entries(secureParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    return url.toString();
  };

  if (!showDebug && !hasCheckoutData) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Input para processar URL */}
      {showDebug && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="w-5 h-5" />
              Processador de URL de Checkout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL de Checkout:</label>
              <div className="flex gap-2">
                <Input
                  value={inputURL}
                  onChange={(e) => setInputURL(e.target.value)}
                  placeholder="Cole a URL de checkout aqui..."
                  className="flex-1"
                />
                <Button onClick={processURL} disabled={!inputURL.trim()}>
                  Processar
                </Button>
                <Button variant="outline" onClick={loadExample}>
                  Exemplo
                </Button>
              </div>
            </div>

            {/* Status da validação */}
            {isValid !== null && (
              <Alert className={isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <div className="flex items-center gap-2">
                  {isValid ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <AlertDescription className={isValid ? "text-green-800" : "text-red-800"}>
                    {validationMessage}
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dados de checkout atuais */}
      {(hasCheckoutData || processedData) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5" />
              Dados de Checkout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Informações principais */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Informações Principais:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Session ID:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {(processedData || checkoutData)?.session_id}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Event ID:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {(processedData || checkoutData)?.event_id}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product ID:</span>
                    <span className="font-medium">{(processedData || checkoutData)?.product_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor:</span>
                    <span className="font-medium text-green-600">
                      {(processedData || checkoutData)?.currency} {(processedData || checkoutData)?.value}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metadados */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Metadados:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Source:</span>
                    <span className="font-medium">{(processedData || checkoutData)?.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Campaign:</span>
                    <span className="font-medium">{(processedData || checkoutData)?.campaign}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant="default" className="text-xs">
                      Válido
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* URL segura gerada */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">URL Segura Gerada:</h4>
              <div className="bg-gray-50 p-3 rounded border">
                <code className="text-xs break-all text-gray-700">
                  {generateSecureURL()}
                </code>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generateSecureURL())}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copiar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(generateSecureURL(), '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Testar
                  </Button>
                </div>
              </div>
            </div>

            {/* UTMs associados */}
            {Object.keys(primaryUTMs).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">UTMs Associados:</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(primaryUTMs).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}: {value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Debug info */}
      {showDebug && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Informações de Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span>Tem dados de E-commerce:</span>
              <Badge variant={hasEcommerceData ? "default" : "secondary"}>
                {hasEcommerceData ? "Sim" : "Não"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Tem dados de Checkout:</span>
              <Badge variant={hasCheckoutData ? "default" : "secondary"}>
                {hasCheckoutData ? "Sim" : "Não"}
              </Badge>
            </div>
            
            {hasEcommerceData && (
              <div className="space-y-2">
                <span className="font-medium">Dados E-commerce:</span>
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(ecommerceData, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}