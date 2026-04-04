# Escuna Búzios — Sistema de Captive Portal

Três arquivos, sem servidor, sem mensalidade além do Z-API.

---

## O que está incluído

| Arquivo | O que faz |
|---|---|
| `portal/index.html` | Página que o cliente vê ao conectar no Wi-Fi |
| `api/codigo-google-script.gs` | Salva os dados na planilha automaticamente |
| `dashboard/dashboard.html` | Seu painel de resultados |

---

## Passo a passo completo

### PASSO 1 — Criar a planilha no Google Sheets

1. Acesse [sheets.google.com](https://sheets.google.com) e crie uma planilha nova
2. Nomeie como **"Escuna Búzios — Cadastros"**
3. Copie o **ID da planilha** da URL:
   - URL de exemplo: `https://docs.google.com/spreadsheets/d/`**`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms`**`/edit`
   - O ID é a parte em negrito

4. Para o dashboard funcionar, a planilha precisa ser pública para leitura:
   - Clique em **Compartilhar** → **Alterar para qualquer pessoa com o link** → **Leitor**

---

### PASSO 2 — Configurar o Google Apps Script

1. Acesse [script.google.com](https://script.google.com)
2. Clique em **Novo projeto**
3. Apague o código existente e cole todo o conteúdo do arquivo `codigo-google-script.gs`
4. Na linha `const SHEET_ID`, substitua `COLE_AQUI_O_ID_DA_SUA_PLANILHA` pelo ID copiado no Passo 1
5. Salve (Ctrl+S) e nomeie o projeto como **"Escuna Portal"**

6. **Teste antes de publicar:**
   - Selecione a função `testar` no menu dropdown
   - Clique em ▶ Executar
   - Autorize as permissões quando solicitado
   - Verifique nos logs se aparece o nome da planilha

7. **Publicar como Web App:**
   - Clique em **Implantar** → **Nova implantação**
   - Tipo: **App da Web**
   - Executar como: **Eu mesmo**
   - Quem tem acesso: **Qualquer pessoa, mesmo anônimos**
   - Clique em **Implantar**
   - **Copie a URL gerada** — você vai precisar dela no próximo passo

---

### PASSO 3 — Configurar o portal

1. Abra o arquivo `portal/index.html` em qualquer editor de texto (Bloco de Notas, VS Code, etc.)
2. Encontre esta linha:
   ```
   const WEBHOOK_URL = 'COLE_AQUI_A_URL_DO_GOOGLE_APPS_SCRIPT';
   ```
3. Substitua pelo URL copiado no Passo 2

---

### PASSO 4 — Hospedar o portal no Vercel (gratuito)

1. Crie uma conta em [vercel.com](https://vercel.com) com o Google
2. Na tela inicial, clique em **Add New → Project**
3. Escolha **"Deploy from your computer"** ou use o drag-and-drop
4. Arraste a **pasta `portal`** para a área de deploy
5. Aguarde o deploy (menos de 1 minuto)
6. Vercel vai te dar uma URL pública, por exemplo: `https://escuna-buzios.vercel.app`
7. **Copie essa URL** — é o endereço do seu captive portal

---

### PASSO 5 — Configurar o roteador

Você precisa de um roteador com OpenWrt instalado. Se ainda não tem:
- Roteador recomendado: **TP-Link Archer C6** (~R$ 180)
- Guia de instalação OpenWrt: [openwrt.org/toh/tp-link/archer_c6](https://openwrt.org/toh/tp-link/archer_c6)

**Com OpenWrt instalado:**
1. Acesse o painel do roteador (geralmente `192.168.1.1`)
2. Vá em **Services → Nodogsplash** (instale pelo menu Software se não aparecer)
3. Em **"Splash Page URL"**, cole a URL do Vercel do Passo 4
4. Salve e reinicie o roteador

**Pronto!** A partir daqui, qualquer celular que conectar no Wi-Fi será redirecionado para o formulário.

---

### PASSO 6 — Configurar o dashboard

1. Abra o arquivo `dashboard/dashboard.html` em um editor de texto
2. Encontre esta linha:
   ```
   const SHEET_ID = 'COLE_AQUI_O_ID_DA_PLANILHA';
   ```
3. Substitua pelo mesmo ID do Passo 1
4. Salve o arquivo e abra no navegador — você já vai ver os dados

> O dashboard pode ficar salvo no seu computador ou ser hospedado no Vercel também (pasta `dashboard`).

---

## Custo total

| Item | Custo |
|---|---|
| Roteador TP-Link Archer C6 | ~R$ 180 (único) |
| Vercel | Gratuito |
| Google Sheets + Apps Script | Gratuito |
| **Total para funcionar** | **~R$ 180** |

> O disparo automático de WhatsApp (Z-API) é opcional e custa ~R$ 50-80/mês.
> Sem ele, o sistema já coleta todos os dados e você pode entrar em contato manualmente.

---

## Dúvidas frequentes

**O portal não aparece quando conecto no Wi-Fi**
→ Verifique se o Nodogsplash está ativo no roteador e se a URL do Vercel está correta.

**Os dados não aparecem na planilha**
→ Teste a URL do Apps Script direto no navegador. Se der erro de permissão, refaça o deploy do Passo 2.

**O dashboard mostra dados de demonstração**
→ O ID da planilha ainda não foi configurado. Siga o Passo 6.
