# Pedido de Peças Embritech

App web (instalável no celular) para pedidos de peças: catálogo com fotos, clientes, pedidos em PDF no modelo do
formulário, envio com nota fiscal, pendências do almoxarifado e login por papel (Supabase).

## Estrutura

```
index.html            página principal (só a "casca": carrega os arquivos abaixo)
manifest.json         dados do app instalável (nome, ícones)
sw.js                 service worker (abertura rápida / uso sem internet)
config.js             SUAS chaves do Supabase (não vem no pacote; modelo em config.exemplo.js)
config.exemplo.js     modelo do config.js

css/estilo.css        todas as cores e o visual (temas claro/escuro no começo do arquivo)
dados/catalogo.js     catálogo de peças (uma peça por linha; campos explicados no topo do arquivo)
fotos/                fotos das peças (o nome do arquivo é indicado no campo "g" da peça)
img/                  logo, símbolo ET e ícones do app
banco/supabase-setup.sql   estrutura do banco (rodar no SQL Editor do Supabase)

js/                   o código, um arquivo por assunto (carregam nesta ordem)
  01-util.js          funções de apoio (textos, armazenamento local, avisos, janelas)
  02-estado.js        dados em memória e como são gravados no aparelho
  03-nuvem.js         Supabase: login, permissões por papel, sincronização
  04-navegacao.js     abas e troca de tela
  10-pecas.js         tela Peças (lista, busca, foto, cadastro/edição)
  11-clientes.js      tela Clientes
  12-pedido.js        tela Novo pedido (vários rascunhos ao mesmo tempo)
  13-historico.js     tela Histórico (envio, nota fiscal PDF, pendências)
  14-categorias.js    tela Categorias
  15-usuarios.js      tela Usuários (administrador)
  16-inicio.js        tela Início
  20-pdf.js           PDF do pedido (modelo do formulário)
  99-iniciar.js       inicialização
```

## Onde mexer

| Quero... | Arquivo |
|---|---|
| mudar cores, tamanhos, aparência | `css/estilo.css` |
| mudar o PDF do pedido | `js/20-pdf.js` |
| mudar o que cada papel pode fazer | `js/03-nuvem.js` (função `can`) e as regras em `banco/supabase-setup.sql` |
| mudar o texto/campos de uma tela | o arquivo da tela em `js/` (`V.parts`, `V.ord`... guardam o HTML) |
| corrigir uma peça, categoria ou foto | `dados/catalogo.js` e `fotos/` (ou pelo próprio app, no ícone ✎) |
| mudar o logo | `img/logo.png` (cabeçalho e login) e `img/simbolo.png` (PDF) |

## Testar no computador

Abra a pasta no VS Code e rode um servidor local (não abra o `index.html` com duplo clique: o PDF e as fotos precisam de servidor):

```
python -m http.server 8000
```

e acesse http://localhost:8000 (ou use a extensão **Live Server** do VS Code). Sem o `config.js`, o app abre em modo local, sem login.

## Publicar (GitHub Pages)

1. Envie todos os arquivos e pastas para o repositório (mantenha o seu `config.js`).
2. **Depois de mudar qualquer arquivo**, aumente a versão para o navegador pegar a novidade:
   em `sw.js` (`ep-v13` → `ep-v14`) e no `index.html` (`?v=13` → `?v=14`).
3. Se existirem, apague da raiz do repositório os arquivos antigos `icon-192.png`, `icon-512.png`
   e `icon-maskable-512.png` (agora ficam em `img/`).

## Banco (Supabase)

Rode `banco/supabase-setup.sql` inteiro no SQL Editor (pode ser repetido sem problema). Depois crie os
usuários em Authentication > Users e defina o papel de cada um na aba **Usuários** do app. O seu usuário
precisa ser administrador: `update public.profiles set papel='admin' where email='SEU@EMAIL';`
