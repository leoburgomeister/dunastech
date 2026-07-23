# Plano de negócio / download do Drive

Pasta destino no Git para o conteúdo baixado do Google Drive.

**Origem local (Windows):**
`C:\Users\Leobu\dev\DunasTech\docs\plano de negócio ai`

Este diretório no cloud agent **ainda está vazio** até você copiar/commitar os arquivos da máquina local (ou anexar no chat).

## Como sincronizar (no PowerShell, na pasta do repo)

```powershell
cd C:\Users\Leobu\dev\DunasTech
git fetch origin
git checkout cursor/plano-acao-consolidado-8aa1
git pull origin cursor/plano-acao-consolidado-8aa1

# Copia o download do Drive para o nome sem acento (melhor no Git)
New-Item -ItemType Directory -Force -Path "docs\plano-de-negocio-ai" | Out-Null
Copy-Item -Path "docs\plano de negócio ai\*" -Destination "docs\plano-de-negocio-ai\" -Recurse -Force

git add "docs/plano-de-negocio-ai"
git commit -m "docs: importa download do Drive (plano de negocio / atas)"
git push origin cursor/plano-acao-consolidado-8aa1
```

Depois diga neste chat: **Drive sincronizado**.
