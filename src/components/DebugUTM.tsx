// 🎯 Componente de Debug para UTMs - Apenas desenvolvimento
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Eye, EyeOff, Trash2, Download } from 'lucide-react';
import { useUTMs } from '@/hooks/use-utm';

interface DebugUTMProps {
  visible?: boolean;
  onToggle?: () => void;
}

export default function DebugUTM({ visible = false, onToggle }: DebugUTMProps) {
  const { 
    utms, 
    primaryUTMs, 
    hasUTMs, 
    addToURL, 
    toURLString, 
    getSource, 
    getCampaign, 
    isAffiliateTraffic,
    exportData 
  } = useUTMs();

  // Apenas mostrar em desenvolvimento
  if (process.env.NODE_ENV === 'production' && !visible) {
    return null;
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportToFile = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utm-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!visible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggle}
          size="sm"
          variant="outline"
          className="bg-yellow-100 border-yellow-300 text-yellow-800"
        >
          <Eye className="w-4 h-4 mr-2" />
          Debug UTM
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="bg-yellow-50 border-yellow-200 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-yellow-800">
              🎯 Debug UTMs
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={exportToFile}
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs"
              >
                <Download className="w-3 h-3" />
              </Button>
              <Button
                onClick={onToggle}
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs"
              >
                <EyeOff className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge variant={hasUTMs ? "default" : "secondary"}>
              {hasUTMs ? "UTMs Ativos" : "Sem UTMs"}
            </Badge>
            {isAffiliateTraffic() && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Tráfego Afiliado
              </Badge>
            )}
          </div>

          {/* UTMs Principais */}
          {hasUTMs && Object.keys(primaryUTMs).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-yellow-800">UTMs Principais:</h4>
              <div className="space-y-1">
                {Object.entries(primaryUTMs).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="font-mono text-yellow-700">{key}:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-900">{value}</span>
                      <Button
                        onClick={() => copyToClipboard(value)}
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Todos os UTMs */}
          {hasUTMs && Object.keys(utms).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-yellow-800">Todos os UTMs:</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {Object.entries(utms).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="font-mono text-yellow-700">{key}:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-900">{value}</span>
                      <Button
                        onClick={() => copyToClipboard(value)}
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informações de Análise */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-yellow-700">Source:</span>
              <span className="text-yellow-900">{getSource()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-700">Campaign:</span>
              <span className="text-yellow-900">{getCampaign()}</span>
            </div>
          </div>

          {/* URL String */}
          {hasUTMs && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-yellow-800">URL String:</h4>
              <div className="bg-white p-2 rounded border border-yellow-200">
                <code className="text-xs text-yellow-900 break-all">
                  {toURLString()}
                </code>
                <Button
                  onClick={() => copyToClipboard(toURLString())}
                  size="sm"
                  variant="ghost"
                  className="mt-1 h-6 px-2 text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copiar
                </Button>
              </div>
            </div>
          )}

          {/* Exemplo de URL com UTMs */}
          {hasUTMs && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-yellow-800">Exemplo URL:</h4>
              <div className="bg-white p-2 rounded border border-yellow-200">
                <code className="text-xs text-yellow-900 break-all">
                  {addToURL('https://go.allpes.com.br/r1wl4qyyfv')}
                </code>
                <Button
                  onClick={() => copyToClipboard(addToURL('https://go.allpes.com.br/r1wl4qyyfv'))}
                  size="sm"
                  variant="ghost"
                  className="mt-1 h-6 px-2 text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copiar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}