# Módulo 2 — Anúncio de Quarto (`listing`)

## Visão Geral

Módulo central da plataforma. Permite ao anfitrião criar, editar, pausar e excluir anúncios de quartos com todas as informações relevantes para o inquilino.

---

## 2.1 Informações Básicas do Anúncio

| Campo          | Tipo   | Obrigatório | Opções / Validação                                                   |
| -------------- | ------ | ----------- | -------------------------------------------------------------------- |
| `title`        | string | ✅          | min 10, max 120 chars                                                |
| `description`  | text   | ✅          | min 50, max 2000 chars                                               |
| `propertyType` | enum   | ✅          | `house`, `apartment`, `condo`, `townhouse`, `studio`, `other`        |
| `listingType`  | enum   | ✅          | `private_room`, `shared_room`, `entire_place`                        |
| `status`       | enum   | auto        | `draft`, `pending_review`, `active`, `paused`, `rejected`, `expired` |

---

## 2.2 Localização

| Campo                | Tipo     | Obrigatório | Descrição                                 |
| -------------------- | -------- | ----------- | ----------------------------------------- |
| `country`            | string   | ✅          | País (EUA, Portugal, Irlanda, etc.)       |
| `state`              | string   | ✅          | Estado/região                             |
| `city`               | string   | ✅          | Cidade                                    |
| `neighborhood`       | string   | ❌          | Bairro                                    |
| `zipCode`            | string   | ✅          | CEP / ZIP code                            |
| `streetAddress`      | string   | ✅          | Endereço (visível só após contato aceito) |
| `latitude`           | decimal  | auto        | Geolocalização (via geocoding do ZIP)     |
| `longitude`          | decimal  | auto        | Geolocalização                            |
| `nearbyLocations`    | string[] | ❌          | Pontos de referência próximos             |
| `publicTransport`    | string   | ❌          | Transporte público próximo                |
| `distanceToDowntown` | string   | ❌          | Distância ao centro                       |

### Regras de negócio

- Endereço exato **nunca** é exibido publicamente
- Mapa público mostra apenas área aproximada (raio de 500m)
- Endereço completo liberado apenas após anfitrião aceitar solicitação

---

## 2.3 Detalhes do Quarto

### Tipo e Tamanho

| Campo          | Tipo    | Obrigatório | Opções                                                                          |
| -------------- | ------- | ----------- | ------------------------------------------------------------------------------- |
| `roomSize`     | enum    | ✅          | `small` (< 10m²), `medium` (10-15m²), `large` (15-20m²), `extra_large` (> 20m²) |
| `roomSizeSqft` | integer | ❌          | Tamanho exato em sq ft                                                          |
| `floorLevel`   | integer | ❌          | Andar (0 = térreo)                                                              |
| `hasWindow`    | boolean | ✅          | Tem janela?                                                                     |
| `hasCloset`    | boolean | ✅          | Tem closet/armário?                                                             |
| `hasLock`      | boolean | ✅          | Quarto tem tranca?                                                              |
| `isFurnished`  | boolean | ✅          | Mobiliado?                                                                      |
| `naturalLight` | enum    | ❌          | `low`, `medium`, `high`                                                         |

### Cama

| Campo               | Tipo    | Obrigatório | Opções                                                                                 |
| ------------------- | ------- | ----------- | -------------------------------------------------------------------------------------- |
| `bedType`           | enum    | ✅          | `single`, `double`, `queen`, `king`, `bunk_bed`, `sofa_bed`, `mattress_only`, `no_bed` |
| `bedCount`          | integer | ✅          | Quantidade de camas (1-4)                                                              |
| `bedsheetsProvided` | boolean | ❌          | Roupa de cama incluída?                                                                |

### Móveis do Quarto

| Campo           | Tipo   | Obrigatório | Descrição        |
| --------------- | ------ | ----------- | ---------------- |
| `roomFurniture` | enum[] | ❌          | Seleção múltipla |

**Opções de `roomFurniture`:**

- `bed` — Cama
- `wardrobe` — Guarda-roupa
- `closet` — Closet
- `desk` — Escrivaninha
- `chair` — Cadeira
- `nightstand` — Criado-mudo
- `dresser` — Cômoda
- `mirror` — Espelho
- `bookshelf` — Estante
- `tv` — TV
- `air_conditioning` — Ar-condicionado
- `fan` — Ventilador
- `heater` — Aquecedor

---

## 2.4 Banheiro

| Campo             | Tipo    | Obrigatório | Opções                                             |
| ----------------- | ------- | ----------- | -------------------------------------------------- |
| `bathroomType`    | enum    | ✅          | `private_ensuite`, `private_not_ensuite`, `shared` |
| `bathroomCount`   | integer | cond.       | Quantos banheiros compartilhados? (se shared)      |
| `sharedWithCount` | integer | cond.       | Compartilhado com quantas pessoas? (se shared)     |
| `hasBathtub`      | boolean | ❌          | Tem banheira?                                      |
| `hasShower`       | boolean | ✅          | Tem chuveiro?                                      |
| `hasBidet`        | boolean | ❌          | Tem bidê?                                          |
| `hotWater`        | enum    | ❌          | `always`, `scheduled`, `limited`                   |
| `towelsProvided`  | boolean | ❌          | Toalhas incluídas?                                 |

**Tipos de banheiro explicados:**

- `private_ensuite` — Banheiro privativo dentro do quarto (suíte)
- `private_not_ensuite` — Banheiro privativo fora do quarto
- `shared` — Banheiro compartilhado com outros moradores

---

## 2.5 Áreas Comuns / Compartilhadas

### Cozinha

| Campo                | Tipo    | Obrigatório | Opções                                 |
| -------------------- | ------- | ----------- | -------------------------------------- |
| `kitchenAccess`      | enum    | ✅          | `full`, `limited`, `scheduled`, `none` |
| `kitchenSchedule`    | string  | cond.       | Horários permitidos (se `scheduled`)   |
| `kitchenAppliances`  | enum[]  | ❌          | Eletrodomésticos disponíveis           |
| `hasOwnCabinetSpace` | boolean | ❌          | Espaço próprio no armário?             |
| `hasOwnFridgeSpace`  | boolean | ❌          | Espaço próprio na geladeira?           |

**Opções de `kitchenAppliances`:**

- `stove` — Fogão
- `oven` — Forno
- `microwave` — Micro-ondas
- `fridge` — Geladeira
- `dishwasher` — Lava-louças
- `toaster` — Torradeira
- `coffee_maker` — Cafeteira
- `blender` — Liquidificador
- `air_fryer` — Airfryer
- `rice_cooker` — Panela de arroz

### Lavanderia

| Campo               | Tipo    | Obrigatório | Opções                                                             |
| ------------------- | ------- | ----------- | ------------------------------------------------------------------ |
| `laundryAccess`     | enum    | ✅          | `in_unit`, `in_building`, `nearby`, `none`                         |
| `laundryFrequency`  | enum    | cond.       | `unlimited`, `weekly_1`, `weekly_2`, `weekly_3`, `monthly_limited` |
| `laundryCost`       | enum    | cond.       | `free`, `paid_per_use`, `included_in_rent`                         |
| `laundryCostAmount` | decimal | cond.       | Custo por uso (se `paid_per_use`)                                  |
| `hasDryer`          | boolean | ❌          | Tem secadora?                                                      |
| `hasIron`           | boolean | ❌          | Tem ferro de passar?                                               |

### Sala / Living

| Campo              | Tipo    | Obrigatório | Opções              |
| ------------------ | ------- | ----------- | ------------------- |
| `livingRoomAccess` | boolean | ✅          | Tem acesso à sala?  |
| `livingRoomShared` | boolean | cond.       | Sala compartilhada? |

### Garagem / Estacionamento

| Campo           | Tipo    | Obrigatório | Opções                                         |
| --------------- | ------- | ----------- | ---------------------------------------------- |
| `parkingType`   | enum    | ✅          | `included`, `available_paid`, `street`, `none` |
| `parkingCost`   | decimal | cond.       | Custo mensal (se `available_paid`)             |
| `parkingSpaces` | integer | cond.       | Quantas vagas?                                 |

### Área Externa

| Campo         | Tipo    | Obrigatório |
| ------------- | ------- | ----------- |
| `hasBackyard` | boolean | ❌          |
| `hasPatio`    | boolean | ❌          |
| `hasBalcony`  | boolean | ❌          |
| `hasPool`     | boolean | ❌          |
| `hasBBQArea`  | boolean | ❌          |

---

## 2.6 Comodidades Gerais da Propriedade

| Campo       | Tipo   | Obrigatório |
| ----------- | ------ | ----------- |
| `amenities` | enum[] | ❌          |

**Opções de `amenities`:**

- `wifi` — Wi-Fi
- `cable_tv` — TV a cabo
- `heating` — Aquecimento central
- `air_conditioning` — Ar-condicionado central
- `elevator` — Elevador
- `security_camera` — Câmera de segurança
- `doorman` — Porteiro
- `intercom` — Interfone
- `gym` — Academia
- `common_area` — Área comum do prédio
- `storage_room` — Depósito
- `mail_box` — Caixa de correio própria
- `bike_storage` — Bicicletário
- `trash_disposal` — Coleta de lixo
- `recycling` — Reciclagem

---

## 2.7 Preço e Condições Financeiras

| Campo               | Tipo    | Obrigatório | Descrição                              |
| ------------------- | ------- | ----------- | -------------------------------------- |
| `pricePerMonth`     | decimal | ✅          | Aluguel mensal (moeda local)           |
| `currency`          | enum    | ✅          | `USD`, `EUR`, `GBP`                    |
| `securityDeposit`   | decimal | ❌          | Caução/depósito                        |
| `depositMonths`     | decimal | ❌          | Equivalente em meses (ex: 1, 1.5, 2)   |
| `utilitiesIncluded` | boolean | ✅          | Contas incluídas no aluguel?           |
| `utilitiesEstimate` | decimal | cond.       | Estimativa mensal (se não incluídas)   |
| `utilitiesDetails`  | string  | ❌          | Quais contas estão/não estão incluídas |
| `internetIncluded`  | boolean | ✅          | Internet incluída?                     |
| `minimumStay`       | integer | ✅          | Estadia mínima em meses (1-12)         |
| `maximumStay`       | integer | ❌          | Estadia máxima em meses                |
| `availableFrom`     | date    | ✅          | Disponível a partir de                 |
| `availableTo`       | date    | ❌          | Disponível até (se temporário)         |
| `paymentMethods`    | enum[]  | ✅          | Formas de pagamento aceitas            |
| `priceNegotiable`   | boolean | ❌          | Preço negociável?                      |

**Opções de `paymentMethods`:**

- `cash` — Dinheiro
- `zelle` — Zelle
- `venmo` — Venmo
- `cashapp` — CashApp
- `bank_transfer` — Transferência bancária
- `check` — Cheque
- `pix` — PIX (para quem recebe no Brasil)
- `credit_card` — Cartão de crédito
- `platform` — Via plataforma (Stripe)

---

## 2.8 Regras da Casa

| Campo                 | Tipo    | Obrigatório | Opções                                                         |
| --------------------- | ------- | ----------- | -------------------------------------------------------------- |
| `allowsPets`          | enum    | ✅          | `yes`, `small_only`, `cats_only`, `dogs_only`, `no`            |
| `petDeposit`          | decimal | cond.       | Depósito extra para pets                                       |
| `allowsSmoking`       | enum    | ✅          | `yes`, `outside_only`, `no`                                    |
| `allowsCouples`       | boolean | ✅          | Aceita casal?                                                  |
| `coupleExtraCharge`   | decimal | cond.       | Valor extra para casal                                         |
| `allowsChildren`      | boolean | ✅          | Aceita crianças?                                               |
| `allowsVisitors`      | enum    | ✅          | `anytime`, `daytime_only`, `with_notice`, `no_overnight`, `no` |
| `quietHours`          | string  | ❌          | Horário de silêncio (ex: "22:00 - 07:00")                      |
| `maxOccupantsPerRoom` | integer | ✅          | Máximo de pessoas no quarto (1-4)                              |
| `additionalRules`     | text    | ❌          | Outras regras (max 1000 chars)                                 |

### Preferências de Inquilino

| Campo                 | Tipo    | Obrigatório | Opções                               |
| --------------------- | ------- | ----------- | ------------------------------------ |
| `preferredGender`     | enum    | ❌          | `male`, `female`, `any`              |
| `preferredAge`        | string  | ❌          | Faixa etária preferida (ex: "25-40") |
| `preferredOccupation` | enum    | ❌          | `student`, `professional`, `any`     |
| `lgbtFriendly`        | boolean | ❌          | LGBTQ+ friendly?                     |
| `prefersBrazilian`    | boolean | ❌          | Prefere brasileiro?                  |

---

## 2.9 Informações da Moradia

| Campo                  | Tipo    | Obrigatório | Descrição                                                          |
| ---------------------- | ------- | ----------- | ------------------------------------------------------------------ |
| `totalRooms`           | integer | ✅          | Total de quartos no imóvel                                         |
| `totalBathrooms`       | integer | ✅          | Total de banheiros                                                 |
| `currentOccupants`     | integer | ✅          | Quantas pessoas moram atualmente                                   |
| `occupantsGender`      | enum    | ❌          | `male`, `female`, `mixed`                                          |
| `occupantsDescription` | string  | ❌          | Breve descrição dos moradores (ex: "2 brasileiros, profissionais") |
| `hostLivesInProperty`  | boolean | ✅          | O anfitrião mora no imóvel?                                        |
| `hasContract`          | boolean | ✅          | Oferece contrato de aluguel?                                       |
| `contractType`         | enum    | cond.       | `formal_lease`, `informal_agreement`, `month_to_month`             |

---

## 2.10 Fotos e Mídia

| Campo             | Tipo    | Obrigatório | Descrição                          |
| ----------------- | ------- | ----------- | ---------------------------------- |
| `photos`          | image[] | ✅          | Mínimo 3, máximo 20 fotos          |
| `coverPhotoIndex` | integer | ✅          | Índice da foto de capa (0-based)   |
| `videoUrl`        | string  | ❌          | Link de vídeo tour (YouTube/Vimeo) |
| `virtualTourUrl`  | string  | ❌          | Link para tour virtual 360°        |

### Regras de fotos

- Formatos: JPG, PNG, WebP
- Tamanho máximo: 10MB por foto
- Resolução mínima: 800x600px
- Obrigatório ao menos 1 foto do quarto
- Recomendado: foto do quarto, banheiro, cozinha, sala, fachada
- Fotos redimensionadas para thumbnail (300x200) e full (1200x800)
- Upload para S3 com CDN CloudFront

---

## 2.11 Status do Anúncio (Lifecycle)

```
draft → pending_review → active → paused (pelo anfitrião)
                       ↘ rejected (pelo admin)

active → expired (após data de disponibilidade)
active → rented (quarto alugado)
```

| Status           | Descrição                                     |
| ---------------- | --------------------------------------------- |
| `draft`          | Rascunho, não publicado                       |
| `pending_review` | Enviado para revisão do admin                 |
| `active`         | Publicado e visível na busca                  |
| `paused`         | Pausado pelo anfitrião (não aparece na busca) |
| `rejected`       | Rejeitado pelo admin (com motivo)             |
| `expired`        | Data de disponibilidade passou                |
| `rented`         | Quarto foi alugado                            |

---

## 2.12 Entidades do Banco

### Tabela `listings`

```
id                    UUID        PK
host_id               UUID        FK -> users.id NOT NULL
title                 VARCHAR(120) NOT NULL
description           TEXT NOT NULL
property_type         VARCHAR(20) NOT NULL
listing_type          VARCHAR(20) NOT NULL
status                VARCHAR(20) DEFAULT 'draft'

-- Localização
country               VARCHAR(50) NOT NULL
state                 VARCHAR(50) NOT NULL
city                  VARCHAR(100) NOT NULL
neighborhood          VARCHAR(100)
zip_code              VARCHAR(20) NOT NULL
street_address        VARCHAR(255) NOT NULL
latitude              DECIMAL(10,7)
longitude             DECIMAL(10,7)
nearby_locations      TEXT[]
public_transport      VARCHAR(255)
distance_to_downtown  VARCHAR(50)

-- Quarto
room_size             VARCHAR(20) NOT NULL
room_size_sqft        INTEGER
floor_level           INTEGER
has_window            BOOLEAN NOT NULL
has_closet            BOOLEAN NOT NULL
has_lock              BOOLEAN NOT NULL
is_furnished          BOOLEAN NOT NULL
natural_light         VARCHAR(10)
bed_type              VARCHAR(20) NOT NULL
bed_count             INTEGER DEFAULT 1
bedsheets_provided    BOOLEAN DEFAULT FALSE
room_furniture        TEXT[]

-- Banheiro
bathroom_type         VARCHAR(30) NOT NULL
bathroom_count        INTEGER
shared_with_count     INTEGER
has_bathtub           BOOLEAN DEFAULT FALSE
has_shower            BOOLEAN DEFAULT TRUE
has_bidet             BOOLEAN DEFAULT FALSE
hot_water             VARCHAR(20)
towels_provided       BOOLEAN DEFAULT FALSE

-- Cozinha
kitchen_access        VARCHAR(20) NOT NULL
kitchen_schedule      VARCHAR(100)
kitchen_appliances    TEXT[]
has_own_cabinet_space BOOLEAN DEFAULT FALSE
has_own_fridge_space  BOOLEAN DEFAULT FALSE

-- Lavanderia
laundry_access        VARCHAR(20) NOT NULL
laundry_frequency     VARCHAR(20)
laundry_cost          VARCHAR(20)
laundry_cost_amount   DECIMAL(10,2)
has_dryer             BOOLEAN DEFAULT FALSE
has_iron              BOOLEAN DEFAULT FALSE

-- Sala e áreas
living_room_access    BOOLEAN DEFAULT FALSE
living_room_shared    BOOLEAN DEFAULT TRUE
parking_type          VARCHAR(20) NOT NULL
parking_cost          DECIMAL(10,2)
parking_spaces        INTEGER
has_backyard          BOOLEAN DEFAULT FALSE
has_patio             BOOLEAN DEFAULT FALSE
has_balcony           BOOLEAN DEFAULT FALSE
has_pool              BOOLEAN DEFAULT FALSE
has_bbq_area          BOOLEAN DEFAULT FALSE
amenities             TEXT[]

-- Preço
price_per_month       DECIMAL(10,2) NOT NULL
currency              VARCHAR(3) NOT NULL DEFAULT 'USD'
security_deposit      DECIMAL(10,2)
deposit_months        DECIMAL(3,1)
utilities_included    BOOLEAN NOT NULL
utilities_estimate    DECIMAL(10,2)
utilities_details     TEXT
internet_included     BOOLEAN NOT NULL
minimum_stay          INTEGER NOT NULL DEFAULT 1
maximum_stay          INTEGER
available_from        DATE NOT NULL
available_to          DATE
payment_methods       TEXT[]
price_negotiable      BOOLEAN DEFAULT FALSE

-- Regras
allows_pets           VARCHAR(20) NOT NULL
pet_deposit           DECIMAL(10,2)
allows_smoking        VARCHAR(20) NOT NULL
allows_couples        BOOLEAN NOT NULL
couple_extra_charge   DECIMAL(10,2)
allows_children       BOOLEAN NOT NULL
allows_visitors       VARCHAR(20) NOT NULL
quiet_hours           VARCHAR(50)
max_occupants         INTEGER NOT NULL DEFAULT 1
additional_rules      TEXT

-- Preferências
preferred_gender      VARCHAR(10)
preferred_age         VARCHAR(20)
preferred_occupation  VARCHAR(20)
lgbt_friendly         BOOLEAN DEFAULT TRUE
prefers_brazilian     BOOLEAN DEFAULT FALSE

-- Moradia
total_rooms           INTEGER NOT NULL
total_bathrooms       INTEGER NOT NULL
current_occupants     INTEGER NOT NULL
occupants_gender      VARCHAR(10)
occupants_description VARCHAR(255)
host_lives_in         BOOLEAN NOT NULL
has_contract          BOOLEAN NOT NULL
contract_type         VARCHAR(30)

-- Mídia
video_url             VARCHAR(500)
virtual_tour_url      VARCHAR(500)
cover_photo_index     INTEGER DEFAULT 0

-- Engajamento (cache/contadores)
view_count            INTEGER DEFAULT 0
favorite_count        INTEGER DEFAULT 0
inquiry_count         INTEGER DEFAULT 0

-- Boost/destaque
is_featured           BOOLEAN DEFAULT FALSE
featured_until        TIMESTAMP

-- Admin
rejection_reason      TEXT
reviewed_by           UUID FK -> users.id
reviewed_at           TIMESTAMP

-- Timestamps
created_at            TIMESTAMP NOT NULL DEFAULT NOW()
updated_at            TIMESTAMP NOT NULL DEFAULT NOW()
deleted_at            TIMESTAMP
```

### Tabela `listing_photos`

```
id                UUID        PK
listing_id        UUID        FK -> listings.id NOT NULL
url               VARCHAR(500) NOT NULL
thumbnail_url     VARCHAR(500) NOT NULL
caption           VARCHAR(200)
sort_order        INTEGER NOT NULL DEFAULT 0
created_at        TIMESTAMP NOT NULL DEFAULT NOW()
```

---

## 2.13 Endpoints

| Método | Rota                                   | Descrição                       | Auth     |
| ------ | -------------------------------------- | ------------------------------- | -------- |
| POST   | `/api/v1/listings`                     | Criar anúncio (rascunho)        | ✅ host  |
| GET    | `/api/v1/listings/:id`                 | Ver anúncio (público se active) | ❌/✅    |
| PATCH  | `/api/v1/listings/:id`                 | Atualizar anúncio               | ✅ owner |
| DELETE | `/api/v1/listings/:id`                 | Soft delete anúncio             | ✅ owner |
| POST   | `/api/v1/listings/:id/publish`         | Enviar para revisão             | ✅ owner |
| POST   | `/api/v1/listings/:id/pause`           | Pausar anúncio                  | ✅ owner |
| POST   | `/api/v1/listings/:id/resume`          | Reativar anúncio                | ✅ owner |
| POST   | `/api/v1/listings/:id/mark-rented`     | Marcar como alugado             | ✅ owner |
| GET    | `/api/v1/listings/my`                  | Meus anúncios                   | ✅ host  |
| POST   | `/api/v1/listings/:id/photos`          | Upload fotos (multipart)        | ✅ owner |
| DELETE | `/api/v1/listings/:id/photos/:photoId` | Remover foto                    | ✅ owner |
| PATCH  | `/api/v1/listings/:id/photos/reorder`  | Reordenar fotos                 | ✅ owner |

---

## 2.14 Páginas Frontend

| Rota                 | Página                            | Auth     |
| -------------------- | --------------------------------- | -------- |
| `/listings/new`      | Criar anúncio (wizard multi-step) | ✅       |
| `/listings/:id/edit` | Editar anúncio                    | ✅ owner |
| `/listings/:id`      | Página do anúncio (pública)       | ❌       |
| `/my-listings`       | Meus anúncios (dashboard)         | ✅       |

### Wizard de criação (multi-step)

1. **Tipo e localização** — propertyType, listingType, endereço
2. **O quarto** — detalhes do quarto, cama, móveis
3. **Banheiro** — tipo, amenidades
4. **Áreas comuns** — cozinha, lavanderia, sala, estacionamento
5. **Preço e condições** — valor, depósito, contas, estadia
6. **Regras da casa** — pets, fumo, casais, crianças, visitas
7. **Sobre a moradia** — moradores, contrato
8. **Fotos** — upload e organização
9. **Revisão** — preview do anúncio antes de publicar
