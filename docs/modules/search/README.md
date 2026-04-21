# Módulo 3 — Busca Pública (`search`)

## Visão Geral

Busca de quartos disponíveis com filtros avançados, mapa interativo e resultados paginados. Acessível sem login.

---

## 3.1 Busca Principal

### Barra de busca rápida

| Campo     | Tipo   | Descrição                           |
| --------- | ------ | ----------------------------------- |
| `query`   | string | Busca textual (cidade, bairro, ZIP) |
| `country` | enum   | País                                |
| `city`    | string | Cidade                              |

### Filtros avançados

#### Localização

| Filtro         | Tipo         | Opções                     |
| -------------- | ------------ | -------------------------- |
| `country`      | select       | Lista de países suportados |
| `state`        | select       | Dinâmico por país          |
| `city`         | autocomplete | Dinâmico por estado        |
| `neighborhood` | autocomplete | Dinâmico por cidade        |
| `zipCode`      | string       | ZIP/CEP                    |
| `radius`       | enum         | 5mi, 10mi, 25mi, 50mi      |
| `nearLocation` | string       | Perto de (endereço/ponto)  |

#### Preço

| Filtro              | Tipo    | Padrão     |
| ------------------- | ------- | ---------- |
| `minPrice`          | integer | 0          |
| `maxPrice`          | integer | sem limite |
| `utilitiesIncluded` | boolean | qualquer   |

#### Quarto

| Filtro        | Tipo         | Opções                                        |
| ------------- | ------------ | --------------------------------------------- |
| `listingType` | multi-select | `private_room`, `shared_room`, `entire_place` |
| `roomSize`    | multi-select | `small`, `medium`, `large`, `extra_large`     |
| `bedType`     | multi-select | todos os tipos                                |
| `isFurnished` | boolean      |                                               |
| `hasWindow`   | boolean      |                                               |
| `hasLock`     | boolean      |                                               |

#### Banheiro

| Filtro         | Tipo         | Opções                                             |
| -------------- | ------------ | -------------------------------------------------- |
| `bathroomType` | multi-select | `private_ensuite`, `private_not_ensuite`, `shared` |

#### Cozinha e Lavanderia

| Filtro          | Tipo         | Opções                             |
| --------------- | ------------ | ---------------------------------- |
| `kitchenAccess` | multi-select | `full`, `limited`, `scheduled`     |
| `laundryAccess` | multi-select | `in_unit`, `in_building`, `nearby` |

#### Regras

| Filtro           | Tipo    |
| ---------------- | ------- |
| `allowsPets`     | boolean |
| `allowsSmoking`  | boolean |
| `allowsCouples`  | boolean |
| `allowsChildren` | boolean |
| `lgbtFriendly`   | boolean |

#### Disponibilidade

| Filtro           | Tipo                |
| ---------------- | ------------------- |
| `availableFrom`  | date                |
| `minimumStayMax` | integer (max meses) |

#### Outros

| Filtro             | Tipo    |
| ------------------ | ------- |
| `hasParking`       | boolean |
| `hasPool`          | boolean |
| `hostVerified`     | boolean |
| `internetIncluded` | boolean |
| `hasContract`      | boolean |

---

## 3.2 Ordenação

| Opção                | Valor                | Padrão |
| -------------------- | -------------------- | ------ |
| Mais recentes        | `createdAt:desc`     | ✅     |
| Preço: menor → maior | `pricePerMonth:asc`  |        |
| Preço: maior → menor | `pricePerMonth:desc` |        |
| Mais populares       | `viewCount:desc`     |        |
| Melhor avaliados     | `avgRating:desc`     |        |

---

## 3.3 Resultados

### Card do anúncio (lista)

Informações exibidas no card de resultado:

- Foto de capa
- Título
- Cidade, Estado, País
- Preço/mês + moeda
- Tipo (quarto privativo/compartilhado)
- Tipo de cama
- Banheiro (privativo/compartilhado)
- Contas incluídas? (badge)
- Mobiliado? (badge)
- Selo "Verificado" (se anfitrião verificado)
- Selo "Destaque" (se anúncio featured)
- Avaliação média + total de reviews
- Disponível a partir de

### Visualizações

- **Lista** — cards em grid (padrão)
- **Mapa** — mapa interativo com pins + mini-cards

---

## 3.4 Mapa Interativo

- Mapa com pins dos anúncios (localização aproximada — raio 500m)
- Ao clicar no pin → mini-card com foto, preço, título
- Arrastar/zoom atualiza resultados automaticamente
- Clusters para muitos pins na mesma região
- Provider: **Mapbox** ou **Google Maps**

---

## 3.5 Página do Anúncio (Detalhe)

Ao clicar em um anúncio, mostra:

1. **Galeria de fotos** — carrossel com lightbox
2. **Título e localização** — cidade, estado (sem endereço exato)
3. **Preço e condições** — valor, depósito, contas, estadia mínima
4. **Detalhes do quarto** — tamanho, cama, móveis, janela, tranca
5. **Banheiro** — tipo, amenidades
6. **Áreas comuns** — cozinha, lavanderia, sala, estacionamento
7. **Comodidades** — lista com ícones
8. **Regras da casa** — pets, fumo, casais, visitas, silêncio
9. **Sobre a moradia** — total de quartos, moradores atuais, contrato
10. **Mapa** — localização aproximada
11. **Sobre o anfitrião** — mini perfil, verificado?, membro desde, avaliações
12. **Avaliações** — lista de reviews
13. **CTA** — botão "Solicitar visita" / "Enviar mensagem"
14. **Anúncios similares** — recomendações

---

## 3.6 SEO

- URLs amigáveis: `/rooms/orlando-fl`, `/rooms/listing-slug-uuid`
- Meta tags dinâmicas (title, description, og:image)
- Schema.org structured data (RentalPosting)
- Sitemap XML dinâmico
- Páginas de cidade indexáveis: `/rooms/orlando`, `/rooms/newark`, `/rooms/lisbon`

---

## 3.7 Endpoints

| Método | Rota                           | Descrição              | Auth |
| ------ | ------------------------------ | ---------------------- | ---- |
| GET    | `/api/v1/listings/search`      | Busca com filtros      | ❌   |
| GET    | `/api/v1/listings/:id/public`  | Detalhe público        | ❌   |
| GET    | `/api/v1/listings/cities`      | Cidades com anúncios   | ❌   |
| GET    | `/api/v1/listings/suggestions` | Autocomplete busca     | ❌   |
| POST   | `/api/v1/listings/:id/view`    | Registrar visualização | ❌   |

### Query params da busca

```
GET /api/v1/listings/search?
  country=US&
  city=Orlando&
  minPrice=500&
  maxPrice=1200&
  listingType=private_room&
  bathroomType=private_ensuite&
  allowsPets=true&
  isFurnished=true&
  sortBy=pricePerMonth&
  order=asc&
  page=1&
  limit=20
```

---

## 3.8 Páginas Frontend

| Rota                 | Página             | Auth |
| -------------------- | ------------------ | ---- |
| `/rooms`             | Busca principal    | ❌   |
| `/rooms/:city`       | Busca por cidade   | ❌   |
| `/rooms/:city/:slug` | Detalhe do anúncio | ❌   |
