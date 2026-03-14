# Backup Automático do MongoDB para Google Drive

Sistema de backup automático configurado para proteger os dados do APSA MovieList.

## Configuração

| Item | Valor |
|------|-------|
| **Frequência** | Diária |
| **Horário** | 06:00 (horário de Brasília) |
| **Destino** | Google Drive → `Backups/mongodb/` |
| **Retenção local** | 3 backups |
| **Retenção na nuvem** | 7 backups |

## Arquivos do Sistema

| Arquivo | Descrição |
|---------|-----------|
| `C:\Scripts\backup-mongodb-gdrive.ps1` | Script principal de backup |
| `C:\Scripts\logs\backup-mongodb.log` | Log de execuções |
| `C:\Backups\mongodb\` | Backups locais temporários |

## Comandos Úteis

### Executar backup manualmente
```powershell
powershell -ExecutionPolicy Bypass -File C:\Scripts\backup-mongodb-gdrive.ps1
```

### Verificar status da tarefa agendada
```powershell
Get-ScheduledTaskInfo -TaskName "MongoDB Backup to Google Drive"
```

### Ver próxima execução
```powershell
(Get-ScheduledTaskInfo -TaskName "MongoDB Backup to Google Drive").NextRunTime
```

### Ver logs recentes
```powershell
Get-Content C:\Scripts\logs\backup-mongodb.log -Tail 30
```

### Forçar execução da tarefa agendada
```powershell
Start-ScheduledTask -TaskName "MongoDB Backup to Google Drive"
```

### Listar backups no Google Drive
```powershell
rclone ls gdrive:Backups/mongodb/
```

## Restaurar Backup

### 1. Baixar backup do Drive
```powershell
rclone copy gdrive:Backups/mongodb/backup-2026-03-13_23-33.zip C:\Temp\
```

### 2. Extrair arquivo
```powershell
Expand-Archive -Path C:\Temp\backup-2026-03-13_23-33.zip -DestinationPath C:\Temp\restore
```

### 3. Restaurar no MongoDB
```powershell
& "C:\Program Files\MongoDB\Tools\100\bin\mongorestore.exe" --db apsa-movielist --drop C:\Temp\restore\*\apsa-movielist
```

> **Nota:** O parâmetro `--drop` remove a base atual antes de restaurar. Remova se quiser mesclar.

## Dependências

- **MongoDB Database Tools** - `mongodump.exe` em `C:\Program Files\MongoDB\Tools\100\bin\`
- **rclone** - Instalado via `winget install Rclone.Rclone`
- **Google Drive** - Configurado no rclone como remote `gdrive`

### Verificar configuração do rclone
```powershell
rclone listremotes
rclone about gdrive:
```

### Reconfigurar Google Drive (se necessário)
```powershell
rclone config
# Escolher: e (edit) → gdrive → seguir wizard
```

## Troubleshooting

### Backup não executou
1. Verificar se o computador estava ligado às 6h
2. Verificar logs: `Get-Content C:\Scripts\logs\backup-mongodb.log -Tail 50`
3. Verificar tarefa: `Get-ScheduledTask -TaskName "MongoDB Backup*" | Select State`

### Erro de autenticação do Google Drive
```powershell
# Testar conexão
rclone lsd gdrive:

# Se falhar, reautenticar
rclone config reconnect gdrive:
```

### MongoDB não está rodando
```powershell
# Verificar serviço
Get-Service MongoDB

# Iniciar se necessário
Start-Service MongoDB
```

## Task Scheduler

A tarefa pode ser visualizada em:
1. `Win + R` → `taskschd.msc`
2. Procurar "MongoDB Backup to Google Drive"

Para editar horário ou frequência, modifique a tarefa pelo Task Scheduler ou:
```powershell
# Alterar para 7h da manhã
$trigger = New-ScheduledTaskTrigger -Daily -At 7:00AM
Set-ScheduledTask -TaskName "MongoDB Backup to Google Drive" -Trigger $trigger
```
