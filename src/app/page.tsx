'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, Server, Globe, Facebook, Activity, Download, Copy, Play } from 'lucide-react';

export default function GTMImplementationGuide() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [copiedCode, setCopiedCode] = useState('');

  const implementationSteps = [
    {
      step: 1,
      title: 'Importar Web GTM',
      description: 'Importar JSON GTM-WPDKD23S-export.json',
      status: 'pending',
      files: ['GTM-WPDKD23S-export.json']
    },
    {
      step: 2,
      title: 'Importar Server GTM',
      description: 'Importar JSON GTM-PVHVLNR9-export.json',
      status: 'pending',
      files: ['GTM-PVHVLNR9-export.json']
    },
    {
      step: 3,
      title: 'Implementar DataLayer',
      description: 'Adicionar códigos no site (4 eventos)',
      status: 'pending',
      files: ['datalayer-structure-simple.md']
    },
    {
      step: 4,
      title: 'Teste Completo',
      description: 'Validar fluxo Web→Server→Facebook/GA4',
      status: 'pending',
      files: ['implementation-guide-simple.md']
    }
  ];

  const codeSnippets = [
    {
      title: 'GTM Snippet (Head)',
      language: 'html',
      code: `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WPDKD23S');</script>`
    },
    {
      title: 'Função Hash SHA256',
      language: 'javascript',
      code: `async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}`
    },
    {
      title: 'View Content Event',
      language: 'javascript',
      code: `pushToDataLayer({
  event: 'view_content',
  content_data: {
    content_type: 'product',
    content_ids: ['PROD_001'],
    content_name: 'Nome do Produto',
    category: 'Categoria',
    value: 199.90,
    currency: 'BRL'
  }
});`
    },
    {
      title: 'Lead Event (Formulário)',
      language: 'javascript',
      code: `pushToDataLayer({
  event: 'lead',
  user_data: {
    sha256_email_address: await sha256(email),
    sha256_phone_number: await sha256(phone),
    first_name: await sha256(name),
    new_customer: true
  },
  lead_data: {
    form_id: 'contact_form',
    form_name: 'Formulário de Contato'
  },
  value: 0.00,
  currency: 'BRL'
});`
    }
  ];

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const downloadFile = (filename: string) => {
    const element = document.createElement('a');
    element.setAttribute('href', `/${filename}`);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 GTM Implementation - 4 Eventos</h1>
          <p className="text-gray-600">Simplificado com JSON para importação direta - Web & Server GTM padronizados</p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Web GTM</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">GTM-WPDKD23S</div>
              <p className="text-xs text-muted-foreground">Container Web</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Server GTM</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">GTM-PVHVLNR9</div>
              <p className="text-xs text-muted-foreground">Container Server</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Domínio</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">collect.*</div>
              <p className="text-xs text-muted-foreground">Server URL</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos</CardTitle>
              <Facebook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">7+</div>
              <p className="text-xs text-muted-foreground">Padronizados</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="steps">Passos</TabsTrigger>
            <TabsTrigger value="code">Código</TabsTrigger>
            <TabsTrigger value="files">Downloads</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Solução Simplificada - 4 Eventos</AlertTitle>
              <AlertDescription>
                Configuração completa com apenas 4 eventos essenciais: page_view, view_content, lead, initiate_checkout.
                Arquivos JSON prontos para importação direta, sem configuração manual necessária.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>🎯 Problemas Resolvidos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">"Tags desaparecidas" no Server GTM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Inconsistência na contagem de eventos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Eventos perdidos no Facebook</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Falta de deduplicação</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Dados PII sem hash</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🚀 Benefícios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Eventos padronizados 100%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Deduplicação com event_id único</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Privacidade com dados hash</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Server-side tracking ativo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Debug completo disponível</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="steps" className="space-y-4">
            <div className="space-y-4">
              {implementationSteps.map((step, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                        {step.step}
                      </div>
                      {step.title}
                      <Badge variant={step.status === 'completed' ? 'default' : 'secondary'}>
                        {step.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Play className="h-4 w-4" />
                      <span>Arquivos necessários:</span>
                      {step.files.map((file, fileIndex) => (
                        <Badge key={fileIndex} variant="outline">{file}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Ordem Importante</AlertTitle>
              <AlertDescription>
                Execute os passos exatamente nesta ordem. Cada passo depende do anterior para funcionar corretamente.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            <div className="space-y-4">
              {codeSnippets.map((snippet, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{snippet.title}</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(snippet.code)}
                        className="flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        {copiedCode === snippet.code ? 'Copiado!' : 'Copiar'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <code>{snippet.code}</code>
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>📁 Arquivos de Configuração</CardTitle>
                <CardDescription>
                  Download todos os arquivos necessários para implementação completa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'GTM-WPDKD23S-export.json', desc: 'Web GTM completo para importação' },
                    { name: 'GTM-PVHVLNR9-export.json', desc: 'Server GTM completo para importação' },
                    { name: 'datalayer-structure-simple.md', desc: 'Estrutura dos 4 eventos' },
                    { name: 'implementation-guide-simple.md', desc: 'Guia passo a passo simplificado' }
                  ].map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{file.name}</h4>
                        <p className="text-sm text-gray-600">{file.desc}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(file.name)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Simplificado e Pronto!</AlertTitle>
              <AlertDescription>
                Com os arquivos JSON você só precisa importar e configurar seus IDs. 
                Siga o implementation-guide-simple.md para implementação rápida.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}