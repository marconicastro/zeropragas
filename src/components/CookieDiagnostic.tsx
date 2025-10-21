'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, RefreshCw, Cookie, Eye, AlertTriangle } from 'lucide-react';

interface CookieStatus {
  name: string;
  value: string | null;
  exists: boolean;
  valid: boolean;
  message: string;
}

interface CookieTestResult {
  fbc: CookieStatus;
  fbp: CookieStatus;
  ga: CookieStatus;
  utm: Record<string, CookieStatus>;
  timestamp: string;
}

export default function CookieDiagnostic() {
  const [cookieStatus, setCookieStatus] = useState<CookieTestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testLog, setTestLog] = useState<string[]>([]);

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    const timestamp = new Date().toLocaleTimeString();
    setTestLog(prev => [...prev, `[${timestamp}] ${icon} ${message}`]);
  };

  const checkCookie = (name: string): CookieStatus => {
    const getCookie = (cookieName: string): string | null => {
      if (typeof document === 'undefined') return null;
      const match = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
      return match ? match[2] : null;
    };

    const value = getCookie(name);
    const exists = !!value;

    let valid = false;
    let message = '';

    if (!exists) {
      message = `Cookie ${name} não encontrado`;
    } else {
      switch (name) {
        case '_fbc':
          // Formato: fb.1.timestamp.fbclid
          valid = /^fb\.1\.\d+\.\w+$/.test(value);
          message = valid ? 'Formato válido' : 'Formato inválido';
          break;
        case '_fbp':
          // Formato: fb.1.timestamp.random
          valid = /^fb\.1\.\d+\.[\w-]+$/.test(value);
          message = valid ? 'Formato válido' : 'Formato inválido';
          break;
        case '_ga':
          // Formato: GA1.2.timestamp.random
          valid = /^GA1\.\d+\.\d+\.\d+$/.test(value);
          message = valid ? 'Formato válido' : 'Formato inválido';
          break;
        default:
          valid = true;
          message = 'Cookie encontrado';
      }
    }

    return {
      name,
      value,
      exists,
      valid,
      message
    };
  };

  const runDiagnostic = () => {
    setIsRunning(true);
    setTestLog([]);
    
    addLog('🔍 Iniciando diagnóstico de cookies...', 'info');

    // Verificar ambiente
    if (typeof window === 'undefined') {
      addLog('❌ Ambiente window não disponível', 'error');
      setIsRunning(false);
      return;
    }

    addLog('✅ Ambiente window disponível', 'success');

    // Verificar todos os cookies
    const allCookies = document.cookie;
    addLog(`📊 Total de cookies encontrados: ${allCookies ? allCookies.split(';').length : 0}`, 'info');
    
    if (allCookies) {
      addLog('📋 Lista de todos os cookies:', 'info');
      allCookies.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        addLog(`   - ${name}`, 'info');
      });
    }

    // Verificar cookies específicos
    const fbcStatus = checkCookie('_fbc');
    const fbpStatus = checkCookie('_fbp');
    const gaStatus = checkCookie('_ga');

    addLog(`🔍 Cookie _fbc: ${fbcStatus.exists ? 'Encontrado' : 'Não encontrado'} - ${fbcStatus.message}`, fbcStatus.exists ? 'success' : 'error');
    addLog(`🔍 Cookie _fbp: ${fbpStatus.exists ? 'Encontrado' : 'Não encontrado'} - ${fbpStatus.message}`, fbpStatus.exists ? 'success' : 'error');
    addLog(`🔍 Cookie _ga: ${gaStatus.exists ? 'Encontrado' : 'Não encontrado'} - ${gaStatus.message}`, gaStatus.exists ? 'success' : 'error');

    // Verificar cookies UTM
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    const utmStatus: Record<string, CookieStatus> = {};
    
    utmParams.forEach(param => {
      const status = checkCookie(param);
      utmStatus[param] = status;
      addLog(`🔍 Cookie ${param}: ${status.exists ? 'Encontrado' : 'Não encontrado'}`, status.exists ? 'success' : 'warning');
    });

    // Verificar fbclid na URL
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');
    addLog(`🔍 fbclid na URL: ${fbclid ? 'Encontrado' : 'Não encontrado'}`, fbclid ? 'success' : 'warning');

    // Montar resultado
    const result: CookieTestResult = {
      fbc: fbcStatus,
      fbp: fbpStatus,
      ga: gaStatus,
      utm: utmStatus,
      timestamp: new Date().toISOString()
    };

    setCookieStatus(result);
    addLog('✅ Diagnóstico concluído!', 'success');
    setIsRunning(false);
  };

  const createMissingCookies = async () => {
    addLog('🔧 Criando cookies ausentes...', 'info');

    // Criar _fbp se não existir
    if (!cookieStatus?.fbp.exists) {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const fbpValue = `fb.1.${timestamp}.${random}`;
      
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 90);
      
      document.cookie = `_fbp=${fbpValue}; expires=${expirationDate.toUTCString()}; path=/; domain=${window.location.hostname}; SameSite=Lax`;
      addLog(`✅ Cookie _fbp criado: ${fbpValue}`, 'success');
    }

    // Criar _fbc se não existir e tiver fbclid na URL
    if (!cookieStatus?.fbc.exists) {
      const urlParams = new URLSearchParams(window.location.search);
      const fbclid = urlParams.get('fbclid');
      
      if (fbclid) {
        const timestamp = Date.now();
        const fbcValue = `fb.1.${timestamp}.${fbclid}`;
        
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 90);
        
        document.cookie = `_fbc=${fbcValue}; expires=${expirationDate.toUTCString()}; path=/; domain=${window.location.hostname}; SameSite=Lax`;
        addLog(`✅ Cookie _fbc criado: ${fbcValue}`, 'success');
      } else {
        addLog('⚠️ fbclid não encontrado na URL, não é possível criar _fbc', 'warning');
      }
    }

    // Re-executar diagnóstico após criar cookies
    setTimeout(() => {
      runDiagnostic();
    }, 1000);
  };

  const testCookieCapture = () => {
    addLog('🧪 Testando captura de cookies...', 'info');

    // Importar e testar a função getFacebookCookies
    import('@/lib/cookies').then(({ getFacebookCookies }) => {
      const cookies = getFacebookCookies();
      addLog(`📊 getFacebookCards() retornou:`, 'info');
      addLog(`   - fbc: ${cookies.fbc || 'null'}`, cookies.fbc ? 'success' : 'error');
      addLog(`   - fbp: ${cookies.fbp || 'null'}`, cookies.fbp ? 'success' : 'error');
    }).catch(error => {
      addLog(`❌ Erro ao importar getFacebookCookies: ${error.message}`, 'error');
    });

    // Importar e testar a função getGoogleClientId
    import('@/lib/cookies').then(({ getGoogleClientId }) => {
      const clientId = getGoogleClientId();
      addLog(`📊 getGoogleClientId() retornou: ${clientId || 'null'}`, clientId ? 'success' : 'error');
    }).catch(error => {
      addLog(`❌ Erro ao importar getGoogleClientId: ${error.message}`, 'error');
    });
  };

  const clearLog = () => {
    setTestLog([]);
  };

  useEffect(() => {
    // Executar diagnóstico automaticamente ao carregar
    runDiagnostic();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            Cookie Diagnostic
          </CardTitle>
          <CardDescription>
            Diagnóstico completo de cookies de rastreamento (fbc, fbp, ga, utm)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="status" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="test">Testes</TabsTrigger>
              <TabsTrigger value="log">Log</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cookieStatus && (
                  <>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Cookie className="h-4 w-4" />
                        <span className="font-medium">Facebook Click (_fbc)</span>
                      </div>
                      <Badge variant={cookieStatus.fbc.exists ? 'default' : 'destructive'}>
                        {cookieStatus.fbc.exists ? 'Presente' : 'Ausente'}
                      </Badge>
                      {cookieStatus.fbc.exists && (
                        <p className="text-xs text-gray-600 mt-2 break-all">
                          {cookieStatus.fbc.value}
                        </p>
                      )}
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Cookie className="h-4 w-4" />
                        <span className="font-medium">Facebook Pixel (_fbp)</span>
                      </div>
                      <Badge variant={cookieStatus.fbp.exists ? 'default' : 'destructive'}>
                        {cookieStatus.fbp.exists ? 'Presente' : 'Ausente'}
                      </Badge>
                      {cookieStatus.fbp.exists && (
                        <p className="text-xs text-gray-600 mt-2 break-all">
                          {cookieStatus.fbp.value}
                        </p>
                      )}
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-4 w-4" />
                        <span className="font-medium">Google Analytics (_ga)</span>
                      </div>
                      <Badge variant={cookieStatus.ga.exists ? 'default' : 'destructive'}>
                        {cookieStatus.ga.exists ? 'Presente' : 'Ausente'}
                      </Badge>
                      {cookieStatus.ga.exists && (
                        <p className="text-xs text-gray-600 mt-2 break-all">
                          {cookieStatus.ga.value}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <Button onClick={runDiagnostic} disabled={isRunning}>
                  {isRunning && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  Atualizar Status
                </Button>
                <Button onClick={createMissingCookies} variant="outline">
                  Criar Cookies Ausentes
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              {cookieStatus && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Detalhes dos Cookies</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Facebook Cookies</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>_fbc:</span>
                          <Badge variant={cookieStatus.fbc.exists ? 'default' : 'destructive'}>
                            {cookieStatus.fbc.exists ? 'Sim' : 'Não'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>_fbp:</span>
                          <Badge variant={cookieStatus.fbp.exists ? 'default' : 'destructive'}>
                            {cookieStatus.fbp.exists ? 'Sim' : 'Não'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">UTM Cookies</h4>
                      <div className="space-y-2 text-sm">
                        {Object.entries(cookieStatus.utm).map(([param, status]) => (
                          <div key={param} className="flex justify-between">
                            <span>{param}:</span>
                            <Badge variant={status.exists ? 'default' : 'secondary'}>
                              {status.exists ? 'Sim' : 'Não'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <h3 className="text-lg font-semibold">Testes de Captura</h3>
              
              <div className="flex gap-3">
                <Button onClick={testCookieCapture}>
                  Testar getFacebookCookies()
                </Button>
                <Button onClick={runDiagnostic} variant="outline">
                  Re-executar Diagnóstico
                </Button>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Os cookies fbc e fbp são essenciais para a atribuição correta 
                  no Facebook. Sem eles, a Meta CAPI não pode associar conversões aos cliques.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="log" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Log de Diagnóstico</h3>
                <Button onClick={clearLog} variant="ghost" size="sm">
                  Limpar
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}