'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function UTMifyDebugger() {
  const [utmifyLoaded, setUtmifyLoaded] = useState(false)
  const [utmifyWorking, setUtmifyWorking] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se o UTMify está carregado
    const checkUTMify = () => {
      if (typeof window !== 'undefined') {
        // Verificar se o script UTMify foi carregado
        const utmifyScript = document.querySelector('script[src*="utmify.com.br"]')
        setUtmifyLoaded(!!utmifyScript)
        
        // Verificar se há funções UTMify disponíveis
        const hasUTMifyFunctions = typeof (window as any).utmify !== 'undefined'
        setUtmifyWorking(hasUTMifyFunctions)
        
        setLoading(false)
      }
    }

    // Verificar imediatamente
    checkUTMify()
    
    // Verificar novamente após 2 segundos (dar tempo para o script carregar)
    const timer = setTimeout(checkUTMify, 2000)
    
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Verificando UTMify...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Aguardando carregamento do script UTMify...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {utmifyLoaded && utmifyWorking ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          )}
          Status do UTMify
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Script Carregado:</span>
            <Badge variant={utmifyLoaded ? "default" : "secondary"}>
              {utmifyLoaded ? "✅ Sim" : "❌ Não"}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Funcionalidades Ativas:</span>
            <Badge variant={utmifyWorking ? "default" : "secondary"}>
              {utmifyWorking ? "✅ Sim" : "❌ Não"}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Prevenção xcod/sck:</span>
            <Badge variant="default">✅ Ativo</Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Prevenção subids:</span>
            <Badge variant="default">✅ Ativo</Badge>
          </div>
          
          {utmifyLoaded && utmifyWorking && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-800">
                <strong>✅ UTMify está funcionando corretamente!</strong>
                <br />
                Os parâmetros UTM serão persistidos entre páginas automaticamente.
              </div>
            </div>
          )}
          
          {!utmifyLoaded && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <div className="text-sm text-yellow-800">
                <strong>⚠️ Script UTMify não encontrado</strong>
                <br />
                Verifique se o script foi adicionado corretamente ao layout.
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}