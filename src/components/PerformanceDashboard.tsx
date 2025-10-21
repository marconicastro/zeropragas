'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  BarChart3,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';
import { eventManager } from '@/lib/eventManager';

interface MetricsData {
  realTime: {
    eventsLast5Minutes: number;
    averageEMQ: number;
    successRate: number;
    averageProcessingTime: number;
    activeChannels: string[];
  };
  hourly: {
    totalEvents: number;
    averageEMQ: number;
    averageProcessingTime: number;
    successRate: number;
    topErrors: Array<{ error: string; count: number }>;
    channelPerformance: Array<{ channel: string; successRate: number; avgTime: number }>;
    emqDistribution: Array<{ range: string; count: number }>;
  };
  healthScore: number;
  recommendations: string[];
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = eventManager.getPerformanceMetrics();
      setMetrics(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000); // Atualizar a cada 30 segundos
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEMQColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportMetrics = () => {
    try {
      const data = eventManager.exportAllMetrics();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tracking-metrics-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar métricas:', error);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando métricas...</span>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Não foi possível carregar as métricas</p>
        <Button onClick={fetchMetrics} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Dashboard de Performance
          </h2>
          <p className="text-sm text-gray-600">
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={exportMetrics}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Saúde do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-3xl font-bold ${getHealthScoreColor(metrics.healthScore)}`}>
                {metrics.healthScore}/100
              </div>
              <p className="text-sm text-gray-600">Score geral de saúde</p>
            </div>
            <div className="text-right">
              {metrics.healthScore >= 90 && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Excelente
                </Badge>
              )}
              {metrics.healthScore >= 70 && metrics.healthScore < 90 && (
                <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Bom
                </Badge>
              )}
              {metrics.healthScore < 70 && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Crítico
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Eventos (5min)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.realTime.eventsLast5Minutes}</div>
            <p className="text-xs text-gray-600">Últimos 5 minutos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              EMQ Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getEMQColor(metrics.realTime.averageEMQ)}`}>
              {metrics.realTime.averageEMQ.toFixed(1)}/10
            </div>
            <p className="text-xs text-gray-600">Event Match Quality</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Taxa de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSuccessRateColor(metrics.realTime.successRate)}`}>
              {metrics.realTime.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600">Eventos bem-sucedidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tempo Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.realTime.averageProcessingTime.toFixed(0)}ms
            </div>
            <p className="text-xs text-gray-600">Processamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Canal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance por Canal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.hourly.channelPerformance.map((channel) => (
              <div key={channel.channel} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{channel.channel}</div>
                  <div className="text-sm text-gray-600">
                    Tempo médio: {channel.avgTime.toFixed(0)}ms
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getSuccessRateColor(channel.successRate)}`}>
                    {channel.successRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Taxa de sucesso</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribuição EMQ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição EMQ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.hourly.emqDistribution.map((range) => (
                <div key={range.range} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-12 text-sm font-medium">{range.range}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          parseFloat(range.range.split('-')[1]) >= 8
                            ? 'bg-green-500'
                            : parseFloat(range.range.split('-')[1]) >= 6
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{
                          width: `${(range.count / metrics.hourly.totalEvents) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-medium w-8 text-right">
                    {range.count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Erros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Principais Erros
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.hourly.topErrors.length > 0 ? (
              <div className="space-y-2">
                {metrics.hourly.topErrors.map((error, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <div className="flex-1 text-sm truncate">{error.error}</div>
                    <Badge variant="destructive" className="ml-2">
                      {error.count}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-green-600 py-4">
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Sem erros registrados</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recomendações */}
      {metrics.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="text-sm">{recommendation}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}