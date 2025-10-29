'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, User, Mail, Phone, MapPin, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface LeadData {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
  captureSource: string;
  capturePage?: string;
  validated: boolean;
  validationDate?: string;
  createdAt: string;
  eventsCount: number;
  recentEvents: Array<{
    id: string;
    eventType: string;
    amount?: number;
    status?: string;
    metaSuccess: boolean;
    createdAt: string;
  }>;
}

export default function DataUnificationPage() {
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'email' | 'phone'>('email');

  const searchLead = async () => {
    setLoading(true);
    setLeadData(null);
    setError(null);

    try {
      const query = searchType === 'email' ? `?email=${encodeURIComponent(searchEmail)}` : `?phone=${encodeURIComponent(searchPhone)}`;
      const response = await fetch(`/api/lead-capture${query}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar lead');
      }

      const data = await response.json();
      setLeadData(data.lead);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'purchase_approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'purchase_refused':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'checkout_abandonment':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <User className="h-4 w-4 text-blue-600" />;
    }
  };

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case 'purchase_approved':
        return <Badge className="bg-green-100 text-green-800">Compra Aprovada</Badge>;
      case 'purchase_refused':
        return <Badge className="bg-red-100 text-red-800">Compra Recusada</Badge>;
      case 'checkout_abandonment':
        return <Badge className="bg-orange-100 text-orange-800">Abandono</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{eventType}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Painel de Dados Unificados</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie dados de leads unificados do sistema
          </p>
        </div>

        {/* Card de Busca */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Lead
            </CardTitle>
            <CardDescription>
              Busque leads por email ou telefone para visualizar dados unificados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={searchType} onValueChange={(value) => setSearchType(value as 'email' | 'phone')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Buscar por Email</TabsTrigger>
                <TabsTrigger value="phone">Buscar por Telefone</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="email@exemplo.com"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchEmail && searchLead()}
                  />
                  <Button 
                    onClick={searchLead} 
                    disabled={!searchEmail || loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Buscar
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="phone" className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="11999999999"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchPhone && searchLead()}
                  />
                  <Button 
                    onClick={searchLead} 
                    disabled={!searchPhone || loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Buscar
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Erro */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Resultado da Busca */}
        {leadData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dados do Lead */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados do Lead
                </CardTitle>
                <CardDescription>
                  Informações unificadas do cliente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Email</span>
                    </div>
                    <p className="text-sm">{leadData.email}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Telefone</span>
                    </div>
                    <p className="text-sm">{leadData.phone || 'Não informado'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Nome</span>
                    </div>
                    <p className="text-sm">{leadData.name || 'Não informado'}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Localização</span>
                    </div>
                    <p className="text-sm">
                      {leadData.city && leadData.state 
                        ? `${leadData.city}/${leadData.state}` 
                        : 'Não informado'}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Fonte de Captura:</span>
                    <Badge variant="outline">{leadData.captureSource}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Validado:</span>
                    <Badge className={leadData.validated ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {leadData.validated ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Data de Captura:</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(leadData.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total de Eventos:</span>
                    <Badge variant="secondary">{leadData.eventsCount}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Eventos Recentes */}
            <Card>
              <CardHeader>
                <CardTitle>Eventos Recentes</CardTitle>
                <CardDescription>
                  Histórico de eventos processados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leadData.recentEvents.length > 0 ? (
                  <div className="space-y-3">
                    {leadData.recentEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getEventIcon(event.eventType)}
                          <div>
                            <div className="flex items-center gap-2">
                              {getEventBadge(event.eventType)}
                              {event.amount && (
                                <span className="text-sm font-medium">R$ {event.amount.toFixed(2)}</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.createdAt).toLocaleDateString('pt-BR')} {new Date(event.createdAt).toLocaleTimeString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {event.metaSuccess ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {event.metaSuccess ? 'Meta OK' : 'Meta Error'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum evento encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Informações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle>Sobre o Sistema de Unificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-medium mb-2">🎯 Prioridade de Dados</h3>
                <p className="text-sm text-muted-foreground">
                  Leads capturados no site têm prioridade sobre dados da Cakto
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-medium mb-2">🔄 Validação Cruzada</h3>
                <p className="text-sm text-muted-foreground">
                  Sistema confronta e unifica dados de múltiplas fontes
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-medium mb-2">📊 Atribuição Perfeita</h3>
                <p className="text-sm text-muted-foreground">
                  Dados consistentes para máxima atribuição na Meta
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}