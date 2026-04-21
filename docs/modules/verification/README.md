# Módulo 10 — Verificação de Identidade (`verification`)

## Visão Geral

Verificação de identidade dos usuários para aumentar confiança na plataforma. Selo "Verificado" visível no perfil e anúncios.

---

## 10.1 Tipos de Verificação

| Nível             | O que verifica            | Selo                     |
| ----------------- | ------------------------- | ------------------------ |
| **Básico**        | E-mail + telefone         | 🔵 E-mail verificado     |
| **Intermediário** | + documento de identidade | 🟢 ID verificado         |
| **Completo**      | + selfie com documento    | ✅ Totalmente verificado |

---

## 10.2 Verificação de E-mail

- Já implementado no módulo Auth
- Link de verificação enviado no cadastro
- Re-enviar link disponível no perfil

---

## 10.3 Verificação de Telefone

| Campo              | Tipo   | Descrição                 |
| ------------------ | ------ | ------------------------- |
| `phone`            | string | Número com código do país |
| `verificationCode` | string | Código SMS de 6 dígitos   |

### Fluxo

1. Usuário informa número de telefone
2. Sistema envia SMS com código de 6 dígitos (expira em 5min)
3. Usuário insere código
4. Telefone verificado

### Regras

- Máximo 3 tentativas de código
- Máximo 5 SMS por dia por número
- Provider: Twilio ou AWS SNS

---

## 10.4 Verificação de Documento

### Documentos aceitos

| País   | Documentos                           |
| ------ | ------------------------------------ |
| Brasil | CPF, RG, CNH, Passaporte             |
| EUA    | Driver's License, State ID, Passport |
| Europa | ID Card, Passport, Residence Permit  |

### Campos do upload

| Campo                | Tipo   | Obrigatório                       |
| -------------------- | ------ | --------------------------------- |
| `documentType`       | enum   | ✅                                |
| `documentCountry`    | string | ✅                                |
| `frontPhoto`         | image  | ✅                                |
| `backPhoto`          | image  | cond. (se documento tem verso)    |
| `selfieWithDocument` | image  | cond. (para verificação completa) |

### Fluxo

1. Usuário seleciona tipo de documento
2. Faz upload da frente (e verso se aplicável)
3. Para verificação completa: selfie segurando o documento
4. Admin revisa manualmente (MVP) ou automático (futuro com OCR/AI)
5. Aprovado → selo de verificado adicionado

### Regras

- Fotos armazenadas com criptografia (S3 + KMS)
- Dados do documento NUNCA expostos na API pública
- Fotos deletadas após verificação aprovada (retém apenas status)
- Verificação expira após 2 anos (re-verificação necessária)
- Admin pode revogar verificação

---

## 10.5 Entidades do Banco

### Tabela `verifications`

```
id                  UUID        PK
user_id             UUID        FK -> users.id NOT NULL
type                VARCHAR(20) NOT NULL  -- 'email', 'phone', 'document', 'selfie'
status              VARCHAR(20) DEFAULT 'pending'  -- pending, approved, rejected, expired
document_type       VARCHAR(30)
document_country    VARCHAR(50)
front_photo_url     VARCHAR(500)
back_photo_url      VARCHAR(500)
selfie_url          VARCHAR(500)
rejection_reason    TEXT
reviewed_by         UUID        FK -> users.id
reviewed_at         TIMESTAMP
expires_at          TIMESTAMP
created_at          TIMESTAMP NOT NULL DEFAULT NOW()
updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
```

### Tabela `phone_verifications`

```
id              UUID        PK
user_id         UUID        FK -> users.id NOT NULL
phone           VARCHAR(20) NOT NULL
code_hash       VARCHAR(255) NOT NULL
attempts        INTEGER DEFAULT 0
expires_at      TIMESTAMP NOT NULL
verified_at     TIMESTAMP
created_at      TIMESTAMP NOT NULL DEFAULT NOW()
```

---

## 10.6 Endpoints

| Método | Rota                                      | Descrição               | Auth     |
| ------ | ----------------------------------------- | ----------------------- | -------- |
| POST   | `/api/v1/verification/phone/send`         | Enviar SMS              | ✅       |
| POST   | `/api/v1/verification/phone/verify`       | Verificar código        | ✅       |
| POST   | `/api/v1/verification/document`           | Upload documento        | ✅       |
| GET    | `/api/v1/verification/status`             | Status das verificações | ✅       |
| GET    | `/api/v1/admin/verifications`             | Fila de verificações    | ✅ admin |
| POST   | `/api/v1/admin/verifications/:id/approve` | Aprovar                 | ✅ admin |
| POST   | `/api/v1/admin/verifications/:id/reject`  | Rejeitar                | ✅ admin |

---

## 10.7 Páginas Frontend

| Rota                   | Página                | Auth     |
| ---------------------- | --------------------- | -------- |
| `/verification`        | Centro de verificação | ✅       |
| `/admin/verifications` | Fila de verificações  | ✅ admin |
