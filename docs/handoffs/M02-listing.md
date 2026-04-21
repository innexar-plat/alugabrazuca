# Handoff — M02 Listing (Anúncio de Quarto)

**Data:** 2026-04-19
**Status:** ✅ Implementado (MVP)

---

## O que foi entregue

### Banco de Dados

- **2 tabelas** criadas via Prisma migration `20260419215338_m2_listing_tables`:
  - `listings` — ~80 campos cobrindo: localização, detalhes do quarto, banheiro, cozinha, lavanderia, sala/estacionamento, área externa, amenidades, preço, regras da casa, preferências de inquilino, informações do imóvel, mídia, contadores de engajamento, boost/destaque, campos administrativos, timestamps + soft delete
  - `listing_photos` — id, listingId, url, thumbnailUrl, caption, sortOrder, createdAt
- **15 enums** adicionados: `PropertyType`, `ListingType`, `ListingStatus`, `RoomSize`, `BedType`, `BathroomType`, `KitchenAccess`, `LaundryAccess`, `ParkingType`, `PetPolicy`, `SmokingPolicy`, `VisitorPolicy`, `Currency`
- **Indexes** em listings: hostId, status, city+status, country+city+status, pricePerMonth, availableFrom, createdAt
- **Relação** `User.listings → Listing[]` configurada

### Backend (NestJS)

- **ListingModule** registrado no AppModule
- **ListingService** — lógica completa:
  - `create()` — cria listing como draft vinculado ao hostId
  - `findOne()` — visualização pública (esconde streetAddress para não-donos, só mostra active/rented para não-donos, incrementa viewCount com fire-and-forget antes de retornar)
  - `findMyListings()` — listagens paginadas do host com primeira foto
  - `update()` — verificação de ownership, reverte status para draft se era active/pending_review
  - `remove()` — soft delete (marca deletedAt)
  - Ciclo de vida: `publish()` (requer 3+ fotos, muda para pending_review), `pause()`, `resume()`, `markRented()`
  - Fotos: `addPhoto()` (máximo 20 por listing), `removePhoto()`, `reorderPhotos()` (em transaction)
  - Helper privado: `findOwnedListing()` verifica ownership + soft delete
- **ListingController** — 12 endpoints:
  - POST `/listings` — criar listing (draft)
  - GET `/listings/my` — minhas listagens (paginado)
  - GET `/listings/:id` — visualização pública (sem auth)
  - PATCH `/listings/:id` — atualizar
  - DELETE `/listings/:id` — soft delete
  - POST `/listings/:id/publish` — publicar (requer 3+ fotos)
  - POST `/listings/:id/pause` — pausar
  - POST `/listings/:id/resume` — reativar
  - POST `/listings/:id/mark-rented` — marcar como alugado
  - POST `/listings/:id/photos` — adicionar foto
  - DELETE `/listings/:id/photos/:photoId` — remover foto
  - PATCH `/listings/:id/photos/reorder` — reordenar fotos
- **DTOs:**
  - `CreateListingDto` — validação completa com class-validator (~80 campos), sanitização XSS em additionalRules, validação de date range (`availableTo >= availableFrom`)
  - `UpdateListingDto` — PartialType do Create (todos campos opcionais)
  - `ListingQueryDto` — page, limit, sortBy, order, status
  - `ReorderPhotosDto` — array de photoIds
- Guards: `JwtAuthGuard` + `@CurrentUser('id')` em todos endpoints de mutação
- GET `/listings/:id` é público (sem guard)
- Compilação limpa (0 erros TypeScript)

### Frontend (Next.js)

- **4 páginas novas:**
  - `/my-listings` — dashboard de listagens do host com status badges coloridos, thumbnails, ações (editar, publicar, pausar, reativar, marcar alugado, deletar com confirmação), estado vazio com link para criar
  - `/listings/new` — wizard de 9 passos: localização, quarto, banheiro, áreas comuns, preço, regras, imóvel, fotos (placeholder), revisão. Indicador de passos clicável, salvar como rascunho ou publicar
  - `/listings/[id]/edit` — edição de listing existente com pré-preenchimento, subconjunto de campos editáveis
  - `/listings/[id]` (público) — página de detalhes com galeria de fotos, informações do quarto, banheiro, regras, imóvel, localização, sidebar com preço/disponibilidade/contato, card do host
- **Layout dashboard** criado em `(dashboard)/layout.tsx` com PublicHeader + PublicFooter
- **i18n** — strings completas em PT, EN, ES com seções:
  - `listing.myListings` — 7 status labels, 6 ações, contadores
  - `listing.create` — título, 9 nomes de passos, 30+ labels de campos
  - `listing.detail` — preço, contato, disponibilidade, detalhes de quarto/banheiro/cozinha/regras/imóvel/host
- Build produção: **30 páginas** geradas com sucesso (6 novas de listing)

### Infraestrutura

- Migration aplicada no banco com sucesso
- Backend rodando com ListingModule carregado (12 rotas mapeadas)
- Frontend compilado sem erros

---

## Endpoints disponíveis

| Método | Rota                                   | Auth | Descrição                   |
| ------ | -------------------------------------- | ---- | --------------------------- |
| POST   | `/api/v1/listings`                     | ✅   | Criar listing (draft)       |
| GET    | `/api/v1/listings/my`                  | ✅   | Minhas listagens (paginado) |
| GET    | `/api/v1/listings/:id`                 | ❌   | Ver listing público         |
| PATCH  | `/api/v1/listings/:id`                 | ✅   | Atualizar listing           |
| DELETE | `/api/v1/listings/:id`                 | ✅   | Soft delete                 |
| POST   | `/api/v1/listings/:id/publish`         | ✅   | Publicar (requer 3+ fotos)  |
| POST   | `/api/v1/listings/:id/pause`           | ✅   | Pausar listing              |
| POST   | `/api/v1/listings/:id/resume`          | ✅   | Reativar listing            |
| POST   | `/api/v1/listings/:id/mark-rented`     | ✅   | Marcar como alugado         |
| POST   | `/api/v1/listings/:id/photos`          | ✅   | Adicionar foto              |
| DELETE | `/api/v1/listings/:id/photos/:photoId` | ✅   | Remover foto                |
| PATCH  | `/api/v1/listings/:id/photos/reorder`  | ✅   | Reordenar fotos             |

---

## Modelo de status (ciclo de vida)

```
DRAFT → (publish) → PENDING_REVIEW → (admin approve) → ACTIVE
ACTIVE → (pause) → PAUSED → (resume) → ACTIVE
ACTIVE → (mark-rented) → RENTED
ACTIVE → (update) → DRAFT (auto-revert)
```

---

## Pendente (futuro)

- [ ] Upload real de fotos para MinIO/S3 (endpoint aceita URL, mas upload direto não implementado)
- [ ] Fluxo de aprovação admin (PENDING_REVIEW → ACTIVE/REJECTED)
- [x] Testes automatizados (unit + integration) do módulo listing — 43 testes (30 service + 13 controller)
- [ ] Geocoding para latitude/longitude baseado no endereço
- [ ] Validação de step 8 (fotos) no wizard frontend — atualmente é placeholder
- [x] Integração com módulo M3 Search para busca pública de listings
- [x] Paginação na página pública de listings (depende do M3)

---

## O que o próximo módulo (M3 Search) pode assumir

- Tabela `listings` existe com todos os campos de localização, preço, amenidades, status
- Indexes compostos em city+status e country+city+status disponíveis para queries de busca
- Enum `ListingStatus` com estados: DRAFT, PENDING_REVIEW, ACTIVE, PAUSED, RENTED, EXPIRED, REJECTED, ARCHIVED
- Endpoint GET `/listings/:id` retorna listing público (apenas ACTIVE/RENTED)
- `ListingService.findOne()` incrementa viewCount automaticamente
- Fotos acessíveis via relação `listing.photos` com sortOrder
- i18n keys para detalhes de listing já existem nos 3 locales
- API client frontend (`lib/api.ts`) pronto para novas chamadas
