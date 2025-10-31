# Guia de Instalação do Cursor no antiX Linux

## 🔍 Passo 1: Diagnóstico

Execute o script de diagnóstico:

```bash
bash diagnostico-cursor.sh
```

Envie os resultados para análise.

---

## ⚠️ Problemas Comuns e Soluções

### Problema 1: Cursor não abre (sem mensagem de erro)

**Tente abrir pelo terminal para ver erros:**

```bash
# Se baixou AppImage:
cd ~/Downloads
chmod +x Cursor-*.AppImage
./Cursor-*.AppImage

# Se instalou via .deb:
/usr/bin/cursor
```

---

### Problema 2: Faltam bibliotecas

**Instale as dependências necessárias:**

```bash
sudo apt update
sudo apt install -y \
    libgtk-3-0 \
    libgbm1 \
    libnss3 \
    libxshmfence1 \
    libasound2 \
    libxss1 \
    libatk-bridge2.0-0 \
    libatspi2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxkbcommon0
```

---

### Problema 3: Erro "GLIBC version too old"

Cursor requer GLIBC 2.28+. No antiX pode ser mais antigo.

**Verificar versão:**
```bash
ldd --version
```

**Solução:** Se a versão for inferior a 2.28, o Cursor não funcionará nativamente. Veja alternativas abaixo.

---

### Problema 4: Hardware/Recursos insuficientes

**Requisitos mínimos do Cursor:**
- 4GB RAM (8GB recomendado)
- CPU com suporte SSE4
- GPU com suporte OpenGL 2.0+

**Verificar suporte SSE4:**
```bash
grep -o 'sse4_[12]' /proc/cpuinfo | sort -u
```

---

## 🚀 Soluções Alternativas (Se Cursor não funcionar)

### Opção 1: VSCode (mais leve)

VSCode é mais leve e funciona em hardware mais antigo:

```bash
# Baixar VSCode
wget https://code.visualstudio.com/sha/download?build=stable&os=linux-deb-x64 -O vscode.deb
sudo dpkg -i vscode.deb
sudo apt --fix-broken install
```

### Opção 2: VSCodium (VSCode open source)

```bash
wget https://github.com/VSCodium/vscodium/releases/download/1.84.2.23288/codium_1.84.2.23288_amd64.deb
sudo dpkg -i codium_*.deb
```

### Opção 3: Editores mais leves

Para PCs muito antigos:
- **Geany** - IDE leve e rápido
  ```bash
  sudo apt install geany geany-plugins
  ```

- **Kate** - Editor do KDE
  ```bash
  sudo apt install kate
  ```

- **Sublime Text** - Leve e poderoso
  ```bash
  wget -qO - https://download.sublimetext.com/sublimehq-pub.gpg | sudo apt-key add -
  echo "deb https://download.sublimetext.com/ apt/stable/" | sudo tee /etc/apt/sources.list.d/sublime-text.list
  sudo apt update
  sudo apt install sublime-text
  ```

---

## 🐛 Debug Avançado

### Ver logs de erro detalhados:

```bash
# Para AppImage:
./Cursor-*.AppImage --verbose

# Ou com mais detalhes:
./Cursor-*.AppImage --enable-logging --v=1
```

### Testar com software rendering (GPU antiga):

```bash
./Cursor-*.AppImage --disable-gpu --disable-software-rasterizer
```

### Rodar com menos recursos:

```bash
./Cursor-*.AppImage --disable-dev-shm-usage --no-sandbox
```

---

## 📝 Próximos Passos

1. Execute o diagnóstico
2. Tente abrir o Cursor pelo terminal
3. Copie TODAS as mensagens de erro que aparecerem
4. Compartilhe os resultados

Com essas informações, posso te ajudar a resolver o problema específico!

---

## 💡 Dica Extra

Se o Cursor for muito pesado para seu PC, considere usar o **Cursor na nuvem** através de serviços como:
- GitHub Codespaces (grátis com limitações)
- GitPod
- Replit

Assim você usa o Cursor sem sobrecarregar seu PC antigo! 🚀
