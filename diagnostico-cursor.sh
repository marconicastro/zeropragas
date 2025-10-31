#!/bin/bash

echo "=== DIAGNÓSTICO DO SISTEMA PARA CURSOR ==="
echo ""

echo "1. Informações do Sistema:"
echo "   Distribuição: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "   Kernel: $(uname -r)"
echo "   Arquitetura: $(uname -m)"
echo ""

echo "2. Recursos de Hardware:"
echo "   CPU: $(lscpu | grep 'Model name' | cut -d':' -f2 | xargs)"
echo "   Memória RAM Total: $(free -h | grep Mem | awk '{print $2}')"
echo "   Memória RAM Disponível: $(free -h | grep Mem | awk '{print $7}')"
echo ""

echo "3. Bibliotecas Necessárias:"
libraries=("libgtk-3-0" "libgbm1" "libnss3" "libasound2" "libxss1")
for lib in "${libraries[@]}"; do
    if dpkg -l | grep -q "^ii.*$lib"; then
        echo "   ✓ $lib instalado"
    else
        echo "   ✗ $lib NÃO instalado"
    fi
done
echo ""

echo "4. Versão do GLIBC:"
ldd --version | head -n1
echo ""

echo "5. Ambiente Gráfico:"
echo "   Display Server: $XDG_SESSION_TYPE"
echo "   Desktop: $DESKTOP_SESSION"
echo ""

echo "6. Verificando arquivos Cursor baixados:"
if [ -d "$HOME/Downloads" ]; then
    echo "   Arquivos Cursor em Downloads:"
    ls -lh "$HOME/Downloads" | grep -i cursor || echo "   Nenhum arquivo Cursor encontrado"
fi
echo ""

echo "=== FIM DO DIAGNÓSTICO ==="
echo ""
echo "Para executar este diagnóstico, copie este arquivo e execute:"
echo "bash diagnostico-cursor.sh"
