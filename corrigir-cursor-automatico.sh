#!/bin/bash

echo "================================================"
echo "  CORREÇÃO AUTOMÁTICA - CURSOR SIGN UP"
echo "  Sistema: antiX Linux"
echo "================================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se comando foi bem-sucedido
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
    fi
}

echo "1️⃣  Atualizando repositórios..."
sudo apt update > /dev/null 2>&1
check_status "Repositórios atualizados"

echo ""
echo "2️⃣  Instalando certificados SSL..."
sudo apt install -y ca-certificates > /dev/null 2>&1
check_status "Certificados instalados"

sudo update-ca-certificates > /dev/null 2>&1
check_status "Certificados atualizados"

echo ""
echo "3️⃣  Instalando bibliotecas de rede necessárias..."
sudo apt install -y libnss3 libnspr4 libcurl4 libgconf-2-4 > /dev/null 2>&1
check_status "Bibliotecas instaladas"

echo ""
echo "4️⃣  Verificando DNS..."
if ! grep -q "nameserver 8.8.8.8" /etc/resolv.conf; then
    echo "nameserver 8.8.8.8" | sudo tee -a /etc/resolv.conf > /dev/null
    echo "nameserver 8.8.4.4" | sudo tee -a /etc/resolv.conf > /dev/null
    check_status "DNS configurado (Google DNS)"
else
    echo -e "${GREEN}✓ DNS já configurado${NC}"
fi

echo ""
echo "5️⃣  Testando conectividade com Cursor..."
if ping -c 2 cursor.sh > /dev/null 2>&1; then
    check_status "Conexão com cursor.sh OK"
else
    echo -e "${RED}✗ Não conseguiu conectar a cursor.sh${NC}"
    echo "   Verifique sua conexão de internet"
fi

echo ""
echo "6️⃣  Testando HTTPS..."
if curl -s -I https://cursor.sh > /dev/null 2>&1; then
    check_status "HTTPS funcionando"
else
    echo -e "${YELLOW}⚠ Problema com HTTPS (pode ser normal)${NC}"
fi

echo ""
echo "7️⃣  Dando permissões aos arquivos AppImage..."
if [ -d "$HOME/Downloads" ]; then
    chmod +x "$HOME/Downloads"/Cursor-*.AppImage 2>/dev/null
    check_status "Permissões configuradas"
else
    echo -e "${YELLOW}⚠ Pasta Downloads não encontrada${NC}"
fi

echo ""
echo "================================================"
echo -e "${GREEN}  CORREÇÕES APLICADAS!${NC}"
echo "================================================"
echo ""
echo "Agora tente abrir o Cursor com este comando:"
echo ""
echo -e "${YELLOW}cd ~/Downloads && ./Cursor-*.AppImage --no-sandbox${NC}"
echo ""
echo "Se o Sign Up ainda não funcionar, tente:"
echo -e "${YELLOW}./Cursor-*.AppImage --disable-gpu --no-sandbox${NC}"
echo ""
echo "Ou crie sua conta primeiro no navegador:"
echo "https://cursor.sh"
echo ""
