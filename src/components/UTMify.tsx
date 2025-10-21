'use client'

import { useEffect } from 'react'

export default function UTMify() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Verificar se o script já foi carregado
      const existingScript = document.querySelector('script[src*="utmify.com.br"]')
      if (existingScript) {
        console.log('🔍 UTMify script já existe no DOM')
        return
      }

      // Criar e adicionar o script
      const script = document.createElement('script')
      script.src = 'https://cdn.utmify.com.br/utms.js'
      script.setAttribute('data-utmify-prevent-xcod-sck', '')
      script.setAttribute('data-utmify-prevent-subids', '')
      script.async = true
      script.defer = true
      
      // Adicionar tratamento de erro
      script.onerror = () => {
        console.error('❌ Erro ao carregar o script UTMify')
        console.log('🔍 Verificando se o URL está correto...')
        
        // Tentar URL alternativo
        const fallbackScript = document.createElement('script')
        fallbackScript.src = 'https://cdn.utmify.com.br/scripts/utms/latest.js'
        fallbackScript.setAttribute('data-utmify-prevent-xcod-sck', '')
        fallbackScript.setAttribute('data-utmify-prevent-subids', '')
        fallbackScript.async = true
        fallbackScript.defer = true
        
        fallbackScript.onerror = () => {
          console.error('❌ Falha ao carregar ambos os URLs do UTMify')
          console.log('🔧 Possíveis soluções:')
          console.log('   1. Verifique sua conexão com a internet')
          console.log('   2. Verifique se o serviço UTMify está online')
          console.log('   3. Verifique se não há bloqueadores de script')
        }
        
        fallbackScript.onload = () => {
          console.log('✅ UTMify carregado com URL alternativo')
        }
        
        document.head.appendChild(fallbackScript)
      }
      
      script.onload = () => {
        console.log('✅ UTMify carregado com sucesso')
        
        // Verificar se as funções UTMify estão disponíveis
        setTimeout(() => {
          if (typeof (window as any).utmify !== 'undefined') {
            console.log('✅ Funções UTMify estão disponíveis')
          } else {
            console.warn('⚠️ Script UTMify carregado mas funções não encontradas')
          }
        }, 1000)
      }
      
      document.head.appendChild(script)
    }
  }, [])

  return null
}