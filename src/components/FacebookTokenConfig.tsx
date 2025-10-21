'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, Info, Key, Shield, Copy, ExternalLink } from 'lucide-react';

export default function FacebookTokenConfig() {
  const [accessToken, setAccessToken] = useState('');
  const [pixelId, setPixelId] = useState('714277868320104');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<any>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if token is already configured
    checkCurrentConfiguration();
  }, []);

  const checkCurrentConfiguration = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      
      if (data.facebook && data.facebook.configured) {
        setIsConfigured(true);
        setPixelId(data.facebook.pixelId || '714277868320104');
      }
    } catch (error) {
      console.error('Error checking configuration:', error);
    }
  };

  const testFacebookConnection = async () => {
    if (!accessToken.trim()) {
      alert('Por favor, insira um access token válido');
      return;
    }

    setTestStatus('testing');
    setTestResult(null);

    try {
      // Test the token with a simple API call
      const response = await fetch(`/api/facebook-pixel/test-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: accessToken.trim(),
          pixelId: pixelId.trim()
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setTestStatus('success');
        setTestResult(result);
      } else {
        setTestStatus('error');
        setTestResult(result);
      }
    } catch (error) {
      setTestStatus('error');
      setTestResult({
        error: 'Erro de conexão: ' + error.message
      });
    }
  };

  const saveConfiguration = async () => {
    if (!accessToken.trim()) {
      alert('Por favor, insira um access token válido');
      return;
    }

    try {
      const response = await fetch(`/api/facebook-pixel/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: accessToken.trim(),
          pixelId: pixelId.trim()
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsConfigured(true);
        alert('Configuração salva com sucesso!');
      } else {
        alert('Erro ao salvar configuração: ' + result.error);
      }
    } catch (error) {
      alert('Erro ao salvar configuração: ' + error.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuração Facebook Access Token</h1>
          <p className="text-muted-foreground">
            Configure o token de acesso para habilitar eventos server-side
          </p>
        </div>
        <Badge variant={isConfigured ? "default" : "destructive"}>
          {isConfigured ? "Configurado" : "Não Configurado"}
        </Badge>
      </div>

      {/* Status Alert */}
      {isConfigured ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Token Configurado</AlertTitle>
          <AlertDescription className="text-green-700">
            O Facebook Access Token está configurado e funcionando. Eventos server-side estão sendo enviados com sucesso.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Token Não Configurado</AlertTitle>
          <AlertDescription className="text-red-700">
            O Facebook Access Token não está configurado. Todos os eventos estão sendo enviados via client-side (fallback).
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="guide">Guia de Configuração</TabsTrigger>
          <TabsTrigger value="troubleshoot">Solução de Problemas</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Configuração do Token
              </CardTitle>
              <CardDescription>
                Insira seu Facebook Access Token para habilitar eventos server-side
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessToken">Facebook Access Token</Label>
                <Input
                  id="accessToken"
                  type="password"
                  placeholder="EAAD..."
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  Token de acesso permanente com permissões: ads_management, ads_read
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pixelId">Pixel ID</Label>
                <Input
                  id="pixelId"
                  placeholder="123456789012345"
                  value={pixelId}
                  onChange={(e) => setPixelId(e.target.value)}
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  ID do seu Facebook Pixel (15 dígitos)
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={testFacebookConnection} disabled={testStatus === 'testing'}>
                  {testStatus === 'testing' ? 'Testando...' : 'Testar Conexão'}
                </Button>
                <Button onClick={saveConfiguration} disabled={!accessToken.trim()}>
                  Salvar Configuração
                </Button>
              </div>

              {/* Test Results */}
              {testResult && (
                <Card className={`mt-4 ${testStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      {testStatus === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      Resultado do Teste
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Como Obter seu Facebook Access Token</CardTitle>
              <CardDescription>
                Siga estes passos para criar um token de acesso permanente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium">Passo 1: Acessar Facebook Developers</h4>
                  <p className="text-sm text-muted-foreground">
                    Acesse{' '}
                    <a 
                      href="https://developers.facebook.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      developers.facebook.com
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    {' '}e faça login com sua conta Facebook.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium">Passo 2: Criar um App</h4>
                  <p className="text-sm text-muted-foreground">
                    Vá para "Meus Apps" → "Criar App" → "Negócio" e dê um nome para seu app.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium">Passo 3: Adicionar Produtos</h4>
                  <p className="text-sm text-muted-foreground">
                    No painel do app, vá para "Produtos" → "Adicionar Produto" → "Marketing API".
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium">Passo 4: Gerar Token</h4>
                  <p className="text-sm text-muted-foreground">
                    Vá para "Ferramentas" → "Graph API Explorer" e selecione seu app.
                  </p>
                  <div className="mt-2 p-3 bg-gray-50 rounded">
                    <p className="text-sm font-mono text-xs mb-2">
                      Permissões necessárias:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">ads_management</Badge>
                      <Badge variant="secondary">ads_read</Badge>
                      <Badge variant="secondary">business_management</Badge>
                    </div>
                  </div>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium">Passo 5: Obter Token Permanente</h4>
                  <p className="text-sm text-muted-foreground">
                    Use o token de curta duração para gerar um token permanente usando a API:
                  </p>
                  <div className="mt-2 p-3 bg-gray-50 rounded relative">
                    <pre className="text-xs font-mono overflow-x-auto">
{`GET /oauth/access_token?
  grant_type=fb_exchange_token&
  client_id={APP_ID}&
  client_secret={APP_SECRET}&
  fb_exchange_token={SHORT_LIVED_TOKEN}`}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(`GET /oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={SHORT_LIVED_TOKEN}`)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshoot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solução de Problemas Comuns</CardTitle>
              <CardDescription>
                Problemas frequentes e como resolvê-los
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium text-yellow-700">Erro: "Invalid OAuth access token"</h4>
                  <p className="text-sm text-yellow-600">
                    O token expirou ou é inválido. Gere um novo token permanente seguindo o guia acima.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium text-yellow-700">Erro: "Permission denied"</h4>
                  <p className="text-sm text-yellow-600">
                    O token não tem as permissões necessárias. Verifique se você tem as permissões: ads_management, ads_read.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium text-yellow-700">Erro: "Invalid pixel ID"</h4>
                  <p className="text-sm text-yellow-600">
                    Verifique se o Pixel ID está correto e se você tem acesso a este pixel na sua conta de anúncios.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium text-yellow-700">Erro: "App not approved"</h4>
                  <p className="text-sm text-yellow-600">
                    Seu app precisa ser aprovado pelo Facebook para uso em produção. Para desenvolvimento, use o modo sandbox.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}