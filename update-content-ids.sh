#!/bin/bash

# Script para atualizar todos os content_ids de 339591 para hacr962
# Atualiza todos os arquivos de eventos Meta para o novo produto Cakto

echo "🔄 Atualizando content_ids de 339591 para hacr962..."

# Lista de arquivos para atualizar
files=(
    "src/lib/meta-pixel-standard.ts"
    "src/lib/meta-deduplication-system.ts"
    "src/lib/utm-manager-v2.ts"
    "src/lib/meta-pixel-definitivo.ts"
    "src/lib/complete-events-fix.ts"
    "src/lib/metaTrackingUnified.ts"
    "src/lib/unified-events-system.ts"
    "src/lib/meta-advanced-events.ts"
    "src/components/CheckoutURLProcessor.tsx"
    "src/app/teste-utm/page.tsx"
    "src/app/live-demo/page.tsx"
    "src/components/DebugUTM.tsx"
)

# Atualizar cada arquivo
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "📝 Atualizando $file..."
        # Substituir 339591 por hacr962
        sed -i 's/339591/hacr962/g' "$file"
        echo "✅ $file atualizado"
    else
        echo "⚠️ Arquivo não encontrado: $file"
    fi
done

echo "🎉 Todos os content_ids foram atualizados para hacr962!"
echo "📊 Produto migrado: Allpes (339591) → Cakto (hacr962)"