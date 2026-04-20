# M03 — Search · Handoff

**Status:** ✅ Completo  
**Data:** 2025-07-20  
**Módulo anterior:** M02 Listing  
**Próximo módulo:** M04 Landing  

---

## 1. O que foi entregue

### Backend (NestJS)

| Arquivo | Descrição |
|---------|-----------|
| `apps/api/src/modules/listing/dto/search-listings.dto.ts` | DTO com todos os filtros de busca (20+ campos com validação class-validator) |
| `apps/api/src/modules/listing/search.service.ts` | Service com `search()`, `getCities()`, `getSuggestions()` |
| `apps/api/src/modules/listing/search.controller.ts` | Controller público com 3 endpoints |
| `apps/api/src/modules/listing/listing.module.ts` | Atualizado — registra SearchController + SearchService |

### Frontend (Next.js)

| Arquivo | Descrição |
|---------|-----------|
| `apps/web/src/app/[locale]/(public)/rooms/page.tsx` | Página de busca com filtros, autocomplete, paginação e ordenação |
| `apps/web/src/messages/pt.json` | +58 chaves `search.*` |
| `apps/web/src/messages/en.json` | +58 chaves `search.*` |
| `apps/web/src/messages/es.json` | +58 chaves `search.*` |

---

## 2. Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/v1/listings/search` | Público | Busca com filtros, paginação e ordenação |
| `GET` | `/api/v1/listings/cities` | Público | Cidades com anúncios ativos (groupBy com count) |
| `GET` | `/api/v1/listings/suggestions` | Público | Autocomplete por cidade/bairro/estado/CEP |

### GET /listings/search — Query Parameters

| Param | Tipo | Default | Descrição |
|-------|------|---------|-----------|
| `page` | int | 1 | Página atual |
| `limit` | int | 20 | Itens por página (max 100) |
| `sortBy` | string | createdAt | Campo de ordenação (createdAt, pricePerMonth, viewCount) |
| `order` | string | desc | Direção (asc/desc) |
| `query` | string | — | Busca por título, cidade, bairro, estado, CEP |
| `country` | string | — | Filtro por país (case-insensitive) |
| `state` | string | — | Filtro por estado |
| `city` | string | — | Filtro por cidade |
| `neighborhood` | string | — | Filtro por bairro (contains) |
| `zipCode` | string | — | Filtro por CEP (startsWith) |
| `minPrice` | number | — | Preço mínimo |
| `maxPrice` | number | — | Preço máximo |
| `listingType` | enum | — | Tipo de quarto |
| `roomSize` | enum | — | Tamanho do quarto |
| `bedType` | enum | — | Tipo de cama |
| `bathroomType` | enum | — | Tipo de banheiro |
| `kitchenAccess` | enum | — | Acesso à cozinha |
| `laundryAccess` | enum | — | Acesso à lavanderia |
| `isFurnished` | boolean | — | Mobiliado |
| `hasWindow` | boolean | — | Tem janela |
| `hasLock` | boolean | — | Tem tranca |
| `utilitiesIncluded` | boolean | — | Contas inclusas |
| `internetIncluded` | boolean | — | Internet inclusa |
| `allowsPets` | boolean | — | Aceita pets (≠ PetPolicy.no) |
| `allowsSmoking` | boolean | — | Permite fumar (≠ SmokingPolicy.no) |
| `allowsCouples` | boolean | — | Aceita casais |
| `allowsChildren` | boolean | — | Aceita crianças |
| `lgbtFriendly` | boolean | — | LGBT+ friendly |
| `availableFrom` | date | — | Disponível até esta data |
| `minimumStayMax` | int | — | Estadia mínima máx (meses) |
| `hasParking` | boolean | — | Tem estacionamento (≠ ParkingType.none) |
| `hasPool` | boolean | — | Tem piscina |
| `hasContract` | boolean | — | Com contrato |

### Resposta padrão (search)
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "...",
      "city": "Orlando",
      "state": "FL",
      "country": "US",
      "pricePerMonth": 850,
      "currency": "USD",
      "listingType": "single_room",
      "isFurnished": true,
      "isFeatured": false,
      "viewCount": 42,
      "photos": [{ "url": "...", "thumbnailUrl": "..." }],
      "host": { "id": "uuid", "firstName": "Ana", "isVerified": true }
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## 3. Regras de Negócio Ativas

- Busca retorna **apenas** listings com `status = active` e `deletedAt = null`
- Listings **featured** aparecem primeiro (ordenação primária)
- Ordenação secundária configurável (createdAt, pricePerMonth, viewCount)
- `sortBy` é sanitizado — apenas campos permitidos são aceitos (whitelist)
- Busca textual usa `contains` (case-insensitive) em título, cidade, bairro, estado
- CEP usa `startsWith` para busca parcial
- `allowsPets=true` filtra qualquer política exceto `no`
- `allowsSmoking=true` filtra qualquer política exceto `no`
- `hasParking=true` filtra qualquer tipo exceto `none`
- `availableFrom` filtra listings disponíveis **até** a data informada (≤)
- `minimumStayMax` filtra listings com estadia mínima **até** o valor informado (≤)
- Suggestions retorna no máximo 10 resultados (distinct city+state+country)
- Suggestions requer mínimo 2 caracteres

---

## 4. Páginas Frontend

| Rota | Descrição |
|------|-----------|
| `/rooms` | Página de busca com barra de pesquisa, autocomplete, filtros avançados, grid de resultados e paginação |

### Funcionalidades da página /rooms
- **Search bar** com autocomplete (suggestions API)
- **Filtros avançados** colapsáveis: preço, tipo, localização, mobiliado, contas, internet, regras, comodidades
- **Grid responsivo** 1→2→3 colunas
- **Cards** com foto, título, localização, preço, badges (mobiliado, contas, internet), featured badge
- **Skeleton loading** durante carregamento
- **Empty state** quando sem resultados
- **Ordenação** por mais recentes, menor/maior preço, mais vistos
- **Paginação** com controles anterior/próxima
- **URL sync** — filtros sincronizados na URL (bookmarkable, shareable)
- **i18n** — 58 chaves em PT, EN, ES

---

## 5. Entidades/Tabelas

Nenhuma tabela nova foi criada. M3 usa a tabela `listings` e `listing_photos` do M2.

---

## 6. O que ficou pendente

- [x] Testes automatizados (SearchService, SearchController) — 67 testes (28 service + 7 controller + 32 DTO)
- [x] Swagger/OpenAPI decorators nos endpoints de busca — @nestjs/swagger instalado, decorators adicionados
- [ ] Rota `/rooms/:city` (busca por cidade com URL amigável)
- [ ] Filtros por `roomSize`, `bedType`, `bathroomType`, `kitchenAccess`, `laundryAccess` no frontend (backend já suporta)
- [ ] Cache Redis para `getCities()` e `getSuggestions()`
- [ ] Map view (visualização em mapa)
- [x] SEO metadata para página /rooms — layout.tsx com generateMetadata + i18n (metaTitle, metaDescription)

---

## 7. O que M04 (Landing) pode assumir como pronto

- Endpoint `GET /listings/search` funcional com todos os filtros
- Endpoint `GET /listings/cities` retorna cidades com contagem de anúncios ativos
- Endpoint `GET /listings/suggestions` retorna autocomplete
- Página `/rooms` funcional com filtros, paginação e ordenação
- i18n com 58 chaves em 3 idiomas
- Landing page pode linkar para `/rooms?city=Orlando` ou `/rooms?country=US`
- Landing page pode usar `GET /listings/cities` para mostrar cidades populares
- Landing page pode usar `GET /listings/search?limit=6&sortBy=createdAt&order=desc` para mostrar destaques
