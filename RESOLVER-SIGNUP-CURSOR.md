# Resolver Problema de Sign Up no Cursor (antiX)

## 🎯 Problema: Cursor abre mas botão Sign Up não funciona

---

## 🔍 Passo 1: Testar Conectividade

Execute estes comandos para verificar se o problema é de rede:

```bash
# Testar conexão com servidores do Cursor
ping -c 4 cursor.sh

# Testar DNS
nslookup cursor.sh

# Testar HTTPS
curl -I https://cursor.sh
curl -I https://api.cursor.sh
```

---

## ✅ Solução 1: Abrir com flags especiais

Tente abrir o Cursor com estas opções:

```bash
# Opção 1: Desabilitar sandbox
./Cursor-*.AppImage --no-sandbox

# Opção 2: Desabilitar GPU
./Cursor-*.AppImage --disable-gpu --no-sandbox

# Opção 3: Modo compatibilidade
./Cursor-*.AppImage --disable-features=VizDisplayCompositor --no-sandbox

# Opção 4: Verbose para ver erros
./Cursor-*.AppImage --no-sandbox --enable-logging --v=1
```

---

## ✅ Solução 2: Instalar certificados SSL atualizados

O antiX pode ter certificados SSL desatualizados:

```bash
# Atualizar certificados
sudo apt update
sudo apt install ca-certificates

# Atualizar lista de certificados
sudo update-ca-certificates
```

---

## ✅ Solução 3: Instalar bibliotecas de rede

Algumas bibliotecas podem estar faltando:

```bash
sudo apt install -y \
    libnss3 \
    libnspr4 \
    libcurl4 \
    libssl1.1 \
    ca-certificates \
    libgconf-2-4
```

---

## ✅ Solução 4: Verificar e configurar DNS

Problemas de DNS podem impedir o login:

```bash
# Ver DNS atual
cat /etc/resolv.conf

# Se estiver vazio ou com problema, adicionar Google DNS:
echo "nameserver 8.8.8.8" | sudo tee -a /etc/resolv.conf
echo "nameserver 8.8.4.4" | sudo tee -a /etc/resolv.conf
```

---

## ✅ Solução 5: Desabilitar proxy/firewall temporariamente

Se usa proxy ou firewall:

```bash
# Verificar se tem proxy configurado
echo $HTTP_PROXY
echo $HTTPS_PROXY

# Desabilitar temporariamente para testar
unset HTTP_PROXY
unset HTTPS_PROXY
unset http_proxy
unset https_proxy

# Depois tentar abrir o Cursor
./Cursor-*.AppImage --no-sandbox
```

---

## ✅ Solução 6: Usar método de login alternativo

Se o botão Sign Up continuar não funcionando, tente:

1. **Criar conta pelo navegador primeiro:**
   - Acesse https://cursor.sh pelo Firefox/Chrome
   - Crie sua conta lá
   - Depois tente fazer login no app

2. **Login via CLI (se disponível):**
   ```bash
   cursor --login
   ```

---

## ✅ Solução 7: Verificar arquivo de log

Veja os logs para encontrar o erro específico:

```bash
# Abrir com logs
./Cursor-*.AppImage --no-sandbox --enable-logging --v=1 2>&1 | tee cursor-log.txt

# Depois de clicar em Sign Up, procurar por erros:
grep -i "error\|failed\|timeout" cursor-log.txt
```

---

## ✅ Solução 8: Permissões e AppArmor

```bash
# Dar permissão de execução
chmod +x Cursor-*.AppImage

# Verificar se AppArmor está bloqueando
sudo aa-status

# Se necessário, desabilitar temporariamente
sudo systemctl stop apparmor
```

---

## 🚀 SOLUÇÃO RÁPIDA - TENTE PRIMEIRO:

Execute este comando único que combina várias correções:

```bash
# Instalar dependências + certificados + configurar DNS
sudo apt update && \
sudo apt install -y ca-certificates libnss3 libnspr4 libcurl4 && \
sudo update-ca-certificates && \
echo "nameserver 8.8.8.8" | sudo tee -a /etc/resolv.conf

# Depois abrir Cursor:
cd ~/Downloads
./Cursor-*.AppImage --no-sandbox
```

---

## 🐛 Debug Detalhado

Se nada funcionar, execute isto e me envie o resultado:

```bash
# Criar script de debug
cat > debug-cursor.sh << 'EOF'
#!/bin/bash
echo "=== DEBUG CURSOR SIGN UP ==="
echo ""
echo "1. Testando conectividade:"
ping -c 2 cursor.sh 2>&1 | head -5
echo ""
echo "2. Testando DNS:"
nslookup cursor.sh 2>&1 | head -10
echo ""
echo "3. Testando HTTPS:"
curl -I https://cursor.sh 2>&1 | head -10
echo ""
echo "4. Certificados SSL:"
ls -la /etc/ssl/certs/ | wc -l
echo ""
echo "5. Bibliotecas de rede:"
ldconfig -p | grep -E "(nss|ssl|curl)"
echo ""
echo "6. Variáveis de proxy:"
env | grep -i proxy
echo ""
echo "=== FIM DEBUG ==="
EOF

chmod +x debug-cursor.sh
./debug-cursor.sh
```

---

## 💡 Alternativa: Usar Cursor Web (Beta)

Se nada funcionar, pode ser que o Cursor tenha uma versão web:

1. Acesse https://cursor.sh
2. Verifique se há opção "Open in Browser" ou "Web Version"
3. Use direto no navegador (Firefox/Chrome)

---

## 📝 O QUE FAZER AGORA:

1. **Execute a "SOLUÇÃO RÁPIDA"** acima
2. **Tente abrir com:** `./Cursor-*.AppImage --no-sandbox`
3. **Clique em Sign Up novamente**
4. **Se não funcionar:** Execute o script de debug e me envie o resultado

Me diga o que aconteceu! 🚀
