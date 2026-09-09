# 08 — Setup e autenticação dos MCPs (DunasTech)

> Objetivo: liberar **Jira**, **Drive (atas)** e ferramentas de execução do app.  
> Auth OAuth interativa **só funciona no Cursor Desktop** — cloud agents não conseguem abrir o popup de login.

---

## 1. O que montamos no repo

Arquivo: [`.cursor/mcp.json`](../../.cursor/mcp.json)

| MCP | Para quê | Auth |
|-----|----------|------|
| **atlassian** | Jira / Confluence (board, issues, atas se estiverem no Confluence) | OAuth no Desktop |
| **notion** | Docs/Notion (se o time usar) | OAuth no Desktop |
| **google-drive** | Pasta Drive + atas `.docx`/Docs | OAuth local na 1ª execução (`npx … auth`) |
| **context7** | Docs de libs (Next, Firebase, etc.) | Sem chave (opcional `CONTEXT7_API_KEY`) |
| **playwright** | E2E / smoke da demo | Sem chave |
| **chrome-devtools** | Performance / CWV | Sem chave |
| **firebase** | Projeto Firebase real | `firebase_login` no Desktop |

Plugins já presentes no Cursor (além do `mcp.json`): **Atlassian**, **Notion**, **Figma**. **Datadog** está com erro e **não é necessário** para o pitch 30/07 — ignore.

---

## 2. Checklist de autenticação (faça no Cursor Desktop)

### A) Atlassian (Jira) — prioridade #1

1. Abra **Cursor Desktop** (não o cloud agent).
2. Vá em **Settings → MCP** (ou Tools & MCP).
3. Em **Atlassian** (plugin e/ou entrada `atlassian` do projeto), clique **Connect / Authenticate**.
4. Complete o OAuth Atlassian com a conta que vê o projeto DunasTech.
5. Confirme que o status muda para **Connected / Ready**.
6. **Importante:** a sessão OAuth do Desktop **não é compartilhada** com este cloud agent. Para o Jira ser lido daqui:
   - continue o trabalho num **Agent chat no Desktop** (recomendado), **ou**
   - cole a **URL do site** (`https://xxx.atlassian.net`) + project key e tente de novo após reiniciar MCPs.
7. Mande: `Jira liberado` + URL do site.

Endpoint oficial usado: `https://mcp.atlassian.com/v1/mcp/authv2`.

### B) Google Drive / pasta local — prioridade #1 (atas)

Download local já feito em:

`C:\Users\Leobu\dev\DunasTech\docs\plano de negócio ai`

Esse path **não existe no cloud**. Destino no Git: [`docs/plano-de-negocio-ai/`](../plano-de-negocio-ai/README.md).

**Caminho mais rápido (sem MCP Drive):** no PowerShell do repo, copie e faça push (comandos no README da pasta). Depois diga `Drive sincronizado`.

Alternativa MCP:
1. No Desktop, ative **google-drive**.
2. Se pedir login: `npx -y @piotr-agier/google-drive-mcp auth`
3. Cole o link da pasta Drive.

### C) Notion — opcional

1. Settings → MCP → **Notion** → Connect.
2. Só necessário se houver páginas oficiais do projeto no Notion (hoje a fonte principal é Git + Jira + Drive).

### D) Firebase — opcional até a demo

1. Após o MCP `firebase` subir: rodar login via tool `firebase_login` no Desktop.
2. Demo pode continuar em mock se estiver estável.

---

## 3. Ordem recomendada (hoje)

```text
1. Desktop → autenticar Atlassian
2. Desktop → autenticar google-drive (+ link da pasta de atas)
3. (Opcional) Notion
4. Voltar ao agente e pedir: "lê o Jira e as atas e atualiza o plano 07"
```

---

## 4. Verificação rápida

Depois do login no Desktop, o agente deve conseguir:

- [ ] Listar/buscar issues do projeto DunasTech no Jira  
- [ ] Listar arquivos na pasta Drive (atas Gemini)  
- [ ] Atualizar [`07-PLANO-ACAO-CONSOLIDADO.md`](07-PLANO-ACAO-CONSOLIDADO.md) com keys reais  

Se ainda aparecer `needsAuth` neste cloud agent após o login no Desktop, **reinicie o MCP** no Desktop ou abra um novo chat cloud na mesma máquina autenticada.

---

## 5. O que este ambiente cloud NÃO faz

- Não abre popup OAuth (`mcp_auth` → *Interactive MCP authentication is only available in the Cursor desktop IDE*).
- Não inventa tokens Jira/Google.
- Não usa Datadog neste fluxo.

---

*Criado em 23/07/2026 junto com o plano consolidado.*
