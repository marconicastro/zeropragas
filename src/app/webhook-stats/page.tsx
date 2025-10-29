'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity, Users, ShoppingCart, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

interface WebhookStats {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  purchaseApproved: number;
  checkoutAbandonment: number;
  purchaseRefused: number;
  duplicatePrevented: number;
  averageProcessingTime: number;
  lastProcessed: string | null;
  uptime: number;
  version: string;
  recentEvents: any[];
  successRate: number;
  uptimeHours: number;
  health: 'excellent' | 'good' | 'warning';
  timestamp: string;
}

export default function WebhookStatsPage() {
  const [stats, setStats] = useState<WebhookStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/webhook-cakto/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    if (autoRefresh) {
      const interval = setInterval(fetchStats, 10000); // Atualizar a cada 10 segundos
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-yellow-500';
      case 'warning': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <TrendingUp className="h-4 w-4" />;
      case 'good': return <Activity className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erro ao carregar estatísticas</h1>
          <Button onClick={fetchStats}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🚀 Webhook Cakto Dashboard</h1>
          <p className="text-muted-foreground">
            Version: {stats.version} • Última atualização: {new Date(stats.timestamp).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={`${getHealthColor(stats.health)} text-white`}>
            {getHealthIcon(stats.health)}
            <span className="ml-2">{stats.health.toUpperCase()}</span>
          </Badge>
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button onClick={fetchStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Processado</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProcessed}</div>
            <p className="text-xs text-muted-foreground">
              Eventos desde {new Date(stats.uptime).toLocaleDateString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.successCount} sucesso / {stats.errorCount} erros
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compras Aprovadas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.purchaseApproved}</div>
            <p className="text-xs text-muted-foreground">
              {stats.checkoutAbandonment} abandonos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProcessingTime}ms</div>
            <p className="text-xs text-muted-foreground">
              {stats.duplicatePrevented} duplicatas evitadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Recentes</CardTitle>
          <CardDescription>
            Últimos eventos processados pelo webhook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum evento processado ainda
              </p>
            ) : (
              stats.recentEvents.slice(0, 10).map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      event.success ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium">{event.eventType}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.transactionId} • {new Date(event.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={event.success ? 'default' : 'destructive'}>
                      {event.success ? 'Sucesso' : 'Erro'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.processingTime}ms • {event.dataSource}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Versão:</span>
              <span className="font-medium">{stats.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uptime:</span>
              <span className="font-medium">{stats.uptimeHours}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Último evento:</span>
              <span className="font-medium">
                {stats.lastProcessed 
                  ? new Date(stats.lastProcessed).toLocaleString('pt-BR')
                  : 'Nenhum'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição de Eventos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Compras:</span>
              <span className="font-medium">{stats.purchaseApproved}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Abandonos:</span>
              <span className="font-medium">{stats.checkoutAbandonment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recusadas:</span>
              <span className="font-medium">{stats.purchaseRefused}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Qualidade do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duplicatas evitadas:</span>
              <span className="font-medium">{stats.duplicatePrevented}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxa de erro:</span>
              <span className="font-medium">
                {stats.totalProcessed > 0 
                  ? Math.round((stats.errorCount / stats.totalProcessed) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Performance:</span>
              <span className="font-medium text-green-600">
                {stats.averageProcessingTime < 500 ? 'Excelente' : 
                 stats.averageProcessingTime < 1000 ? 'Boa' : 'Regular'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}