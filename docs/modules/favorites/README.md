# Módulo 8 — Favoritos (`favorites`)

## Visão Geral
Permite ao inquilino salvar anúncios de interesse para consultar depois.

---

## 8.1 Funcionalidades

- Botão de coração em cada card/anúncio
- Lista de favoritos no painel do inquilino
- Organizar favoritos por coleções/pastas (futuro)
- Notificar quando anúncio favorito baixar de preço (futuro)
- Notificar quando anúncio favorito estiver prestes a expirar

---

## 8.2 Regras de Negócio

- Apenas usuários logados podem favoritar
- Toggle: favoritar/desfavoritar mesmo botão
- Contador de favoritos atualizado no anúncio
- Favoritos de anúncios removidos/expirados ficam cinza
- Paginação na lista de favoritos

---

## 8.3 Entidades do Banco

### Tabela `favorites`

```
id          UUID        PK
user_id     UUID        FK -> users.id NOT NULL
listing_id  UUID        FK -> listings.id NOT NULL
created_at  TIMESTAMP NOT NULL DEFAULT NOW()

UNIQUE(user_id, listing_id)
```

---

## 8.4 Endpoints

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/v1/favorites/:listingId` | Favoritar | ✅ |
| DELETE | `/api/v1/favorites/:listingId` | Desfavoritar | ✅ |
| GET | `/api/v1/favorites` | Meus favoritos | ✅ |
| GET | `/api/v1/favorites/check/:listingId` | Verificar se é favorito | ✅ |

---

## 8.5 Páginas Frontend

| Rota | Página | Auth |
|------|--------|------|
| `/favorites` | Lista de favoritos | ✅ |
