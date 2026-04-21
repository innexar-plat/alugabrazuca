# Usuários de Teste — BrasilQuartos

> Senha padrão para todos: `Test@1234`

## Hosts (proprietários)

| Nome            | Email           | Cidade      | Verificado |
| --------------- | --------------- | ----------- | ---------- |
| Ana Silva       | ana@test.com    | Orlando, US | ✅         |
| Carlos Santos   | carlos@test.com | Boston, US  | ✅         |
| Maria Oliveira  | maria@test.com  | Lisboa, PT  | ✅         |
| João Pereira    | joao@test.com   | Orlando, US | ❌         |
| Camila Ferreira | camila@test.com | Lisboa, PT  | ✅         |

## Tenants (inquilinos)

| Nome           | Email             | Cidade             | Idioma |
| -------------- | ----------------- | ------------------ | ------ |
| Fernanda Costa | fernanda@test.com | São Paulo, BR      | PT     |
| Lucas Almeida  | lucas@test.com    | Rio de Janeiro, BR | EN     |
| Beatriz Souza  | beatriz@test.com  | Belo Horizonte, BR | PT     |
| Rafael Lima    | rafael@test.com   | Curitiba, BR       | ES     |
| Diego Martins  | diego@test.com    | Recife, BR         | PT     |

## Listings por cidade

| Cidade      | Qtd | Faixa de preço |
| ----------- | --- | -------------- |
| Orlando, FL | 4   | $450 – $1,500  |
| Boston, MA  | 3   | $550 – $1,600  |
| Lisboa, PT  | 3   | €400 – €750    |

## Como testar

1. Acesse `http://localhost:3000/login`
2. Use qualquer email acima + senha `Test@1234`
3. Hosts podem ver seus anúncios em `/my-listings`
4. Busca pública em `/rooms`
