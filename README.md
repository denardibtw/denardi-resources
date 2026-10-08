# Denardi Dev - Resources MTA:SA

Uma loja/portfólio em português, com catálogo escuro inspirado na composição da [referência indicada](https://www.vames-store.com/category/2092562), visual responsivo, seis produtos demonstrativos, quatro categorias, busca, filtros por apresentação com ou sem vídeo, ordenação, detalhes em modal com vídeo em destaque, carrossel com vídeo primeiro e várias imagens, links individuais e contato pelo perfil do Discord de denardi. Não há checkout, backend, pagamentos ou cadastro de clientes.

**A loja usa o nome Denardi Dev - Resources MTA:SA. Os produtos, preços, funcionalidades e previews são demonstrativos.** Os clipes são ilustrações originais, não capturas de resources reais em execução. As thumbnails serão fornecidas por você; enquanto não forem adicionadas, aparece um espaço reservado neutro. Substitua o conteúdo antes de divulgar como sua loja.

## 1. Abrir a loja

Abra `index.html` com um navegador. Não é necessário instalar pacotes, compilar ou criar uma conta para testar localmente.

Opcionalmente, na pasta do projeto, use um servidor local se já tiver Python instalado:

```sh
python -m http.server 8000
```

Acesse `http://localhost:8000`. Para parar, pressione `Ctrl+C` no terminal. Não é necessário ter Python para publicar no GitHub.

## 2. Personalizar antes de publicar

O arquivo principal para edição é **`assets/data.js`**. Você pode editar pelo Bloco de Notas, um editor de código ou pelo próprio GitHub. Preserve aspas, chaves e vírgulas.

### Home e catálogo

A página inicial segue a composição da [home de referência](https://www.vames-store.com/): fundo de cidade, título centralizado, faixa com quatro benefícios, produto em destaque com vídeo e três cards. Os textos foram adaptados para Denardi Dev e MTA:SA. Não há estatísticas de vendas nem compradores inventados.

Em `STORE_CONFIG.home`, personalize `welcome`, `title`, `description`, `heroImage`, `highlightProductId`, `highlightLabel` e `featuredProductIds`. Use IDs de produtos existentes em `highlightProductId` e `featuredProductIds`. O produto em destaque utiliza o primeiro vídeo configurado nele; os três cards também abrem os detalhes com carrossel.

O fundo decorativo `assets/img/home-city.webp` foi obtido da home indicada como referência. Pode substituí-lo por sua imagem, atualizando `heroImage`; ele é decorativo e não é uma captura de um resource seu. As thumbnails dos produtos continuam vazias para você fornecer as imagens reais.

Os links `#inicio` e `#catalogo` alternam entre home e Scripts no mesmo site estático, sem exigir configuração adicional no Pages. As categorias da home abrem o catálogo já filtrado. O vídeo de destaque só reproduz após clicar e para ao abrir um produto ou trocar de página.

### Marca e contatos

Em `STORE_CONFIG`, altere:

| Campo | Conteúdo |
| --- | --- |
| `catalogTitle` | Título da vitrine, por exemplo Scripts ou Resources. |
| `name` | Nome da sua marca; atualiza cabeçalho e rodapé. |
| `pageTitle` | Título exibido na aba do navegador. |
| `description` | Descrição curta do site para mecanismos de busca. |
| `discordUrl` | Perfil do Discord: `https://discord.com/users/237549379702095872`. |
| `discordUsername` | Nome exibido no contato: `denardi`. |
| `discordId` | ID exibido: `237549379702095872`. Preserve como texto entre aspas. |
| `demoMode` | Mantenha `true` até substituir todo o conteúdo demonstrativo. |

O contato já está configurado: **denardi**, **id: 237549379702095872**. Nos detalhes dos produtos e no rodapé, o nome abre o perfil no Discord em uma nova aba. Não há botões de WhatsApp ou de conversa no Discord. O comprador pode copiar o link do resource no modal e enviá-lo ao entrar em contato.

Para atualizar o contato, altere `discordUrl`, `discordUsername` e `discordId` em `assets/data.js`. Não inclua senhas, tokens ou dados privados: o código de um site estático fica acessível aos visitantes.

### Produtos

Cada objeto em `STORE_PRODUCTS` é um produto. Troque nome, descrição curta e completa, preço, categoria, imagem, funcionalidades, requisitos, versão e condições de entrega. O preço é um número com ponto decimal, como `79.90`; a página o formata em reais.

Para adicionar um produto, copie um objeto completo e personalize:

```js
{
  id: "meu-resource", // Único, sem espaços. Prefira letras minúsculas e hífens.
  name: "Nome real do resource",
  category: "interfaces", // ID de uma categoria cadastrada.
  price: 79.90,
  image: "./assets/img/meu-resource.webp",
  imageAlt: "Descrição da imagem para acessibilidade",
  images: [], // Outras imagens do resource, na ordem em que devem aparecer no carrossel.
  badge: "", // Opcional. Use apenas uma informação verdadeira.
  featured: false,
  version: "1.0",
  description: "Descrição curta e real do produto.",
  longDescription: "Descrição completa do que ele faz.",
  features: ["Funcionalidade real 1", "Funcionalidade real 2"],
  requirements: ["Versão necessária do MTA:SA", "Dependências reais"],
  delivery: "Informe arquivos entregues, licença, instalação e suporte reais.",
  tags: ["HUD", "Interface"],
  videoUrl: "", // YouTube, Vimeo ou ./assets/videos/meu-resource.mp4.
  videoTitle: "Apresentação do resource", // Opcional.
  videoPoster: "", // Opcional; sem este campo, usa image.
  videoCaptions: "", // Opcional: ./assets/videos/legendas-pt.vtt.
  extraVideos: [], // Opcional: outros vídeos do mesmo produto.
},
```

O `id` cria um link como `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/#resource/meu-resource`. Preserve os IDs após compartilhar links. Os detalhes ficam em um modal: não são necessários arquivos separados ou regras de redirecionamento.

### Imagens, categorias e textos

**Várias imagens por resource:** mantenha a thumbnail em `image` e adicione as demais em `images`. A thumbnail também entra como a primeira imagem do carrossel. Envie os arquivos para `assets/img/` e preencha os caminhos:

```js
image: "./assets/img/hud-thumbnail.webp",
imageAlt: "Visão geral do HUD",
images: [
  { src: "./assets/img/hud-veiculo.webp", alt: "HUD com informações do veículo", title: "Informações do veículo" },
  { src: "./assets/img/hud-detalhes.webp", alt: "Detalhes da interface", title: "Detalhes da interface" },
],
```

Também pode usar uma lista simples, como `images: ["./assets/img/imagem-1.webp", "./assets/img/imagem-2.webp"]`. Prefira objetos com `alt` para descrever cada imagem. Os exemplos de caminhos acima são apenas instruções: acrescente seus próprios arquivos. Imagens repetidas com o mesmo caminho aparecem uma só vez.

**Você fornece as thumbnails.** Não há geração de capas nem extração automática de imagens dos vídeos.

1. Envie sua thumbnail para `assets/img/`, por exemplo `hud-thumbnail.webp`.
2. No produto correspondente em `assets/data.js`, preencha `image: "./assets/img/hud-thumbnail.webp"` e `imageAlt` com uma descrição da imagem.
3. Publique a atualização normalmente. A thumbnail aparece no card, no carrossel e como capa do vídeo. Se quiser uma capa diferente no player, preencha `videoPoster`.

Deixe `image: ""` enquanto não houver thumbnail. O site mantém o espaço reservado e os vídeos continuam funcionando. Prefira JPG, PNG ou WebP em 16:9, por exemplo 1280 × 720 px; sua imagem é exibida sem adicionar títulos ou outros elementos à arte.

- Coloque suas thumbnails em `assets/img/`.
- Use caminhos como `./assets/img/arquivo.webp`. Respeite maiúsculas/minúsculas: `Preview.png` e `preview.png` são nomes diferentes no GitHub Pages.
- Edite `STORE_CATEGORIES` para renomear ou acrescentar categorias. Os ícones disponíveis são `layout`, `layers`, `car`, `map` e `grid`. O filtro “Todos” é automático.
- Em `index.html`, personalize a navegação, o rodapé e os textos das janelas de compra, dúvidas e informações. Os cards, capas e players são preenchidos pelos produtos de `data.js`.
- Edite `assets/styles.css` para trocar cores e fontes. As variáveis de cor estão no início do arquivo.
- Troque `assets/img/brand.svg` e `assets/img/favicon.svg` se tiver um logo próprio. O texto da marca é atualizado por `data.js`; o desenho atual é demonstrativo.
- A FAQ de compatibilidade também contém textos de exemplo. Ajuste-a às condições reais da sua loja.
- Após substituir produtos, valores, funcionalidades, previews, marca e textos, altere `demoMode: true` para `demoMode: false`. Isso remove os avisos globais e as etiquetas DEMO; não substitui automaticamente textos demonstrativos dentro dos dados, das imagens ou dos vídeos.

## Adicionar os vídeos dos seus resources

O vídeo principal é a primeira mídia do carrossel quando estiver configurado. Use as setas laterais para ver as imagens do resource; as bolinhas abaixo também permitem escolher uma mídia. O contador indica a posição. As setas do teclado funcionam quando o carrossel ou seus controles estão em foco. A imagem da vitrine ganha um botão de assistir. Nos detalhes, o player aparece em destaque ao lado do nome, preço e contato do Discord; no celular, o conteúdo se organiza em uma coluna. Nenhum vídeo toca ao simplesmente entrar no site. Os controles permitem pausar e entrar em tela cheia; fechar os detalhes ou escolher outra mídia interrompe a reprodução.

Em `assets/data.js`, basta preencher **`videoUrl`** em cada produto:

```js
// YouTube: troque ID_DO_VIDEO pelo ID verdadeiro do seu vídeo.
videoUrl: "https://www.youtube.com/watch?v=ID_DO_VIDEO",
// Também aceita youtu.be, Shorts e links /embed/.
```

```js
// Vimeo: use o link real do seu vídeo.
videoUrl: "https://vimeo.com/NUMERO_DO_VIDEO",
// Links não listados preservam o código privado da URL (h ou /codigo).
```

```js
// Arquivo local: envie o arquivo para assets/videos/ e mantenha o caminho relativo.
videoUrl: "./assets/videos/meu-resource.mp4",
videoTitle: "Veja o resource em funcionamento",
videoPoster: "./assets/img/meu-resource.webp", // Capa opcional.
videoCaptions: "./assets/videos/legendas-pt.vtt", // Legendas opcionais em WebVTT.
```

Você pode usar MP4, WebM ou OGV, inclusive em uma URL HTTPS direta. A reprodução depende do codec suportado pelo navegador; MP4 com H.264/AAC é uma opção amplamente compatível. Prefira YouTube ou Vimeo para gravações longas, para manter o repositório e o carregamento leves.

Para **vários vídeos por produto**, mantenha o principal em `videoUrl` e acrescente `extraVideos`:

```js
extraVideos: [
  { title: "Instalação", url: "https://youtu.be/ID_DO_VIDEO" },
  {
    title: "Personalização",
    url: "./assets/videos/personalizacao.webm",
    poster: "./assets/img/personalizacao.webp", // Opcional.
    captions: "./assets/videos/personalizacao-pt.vtt", // Opcional.
  },
],
```

A ordem do carrossel é **vídeo principal → imagens → vídeos adicionais**. Assim, avançar uma vez a partir do vídeo principal já mostra a primeira imagem. Se `videoUrl` estiver vazio, o primeiro vídeo válido de `extraVideos` ocupa a primeira posição; sem vídeos, o carrossel começa pelas imagens. Se ainda não houver imagens, aparece apenas um espaço reservado neutro para elas. Links HTTPS de outros serviços continuam disponíveis em outra aba.

**Demonstrações incluídas:** os dois clipes do HUD e o clipe de inventário são animações de interface, com avisos e legendas. Não demonstram recursos reais. Troque os arquivos, links, títulos, capas e legendas pelo seu material antes de tirar os avisos demonstrativos.

Os players de YouTube/Vimeo são carregados somente ao clicar em assistir. O proprietário do vídeo precisa permitir a incorporação no seu domínio. Para conferir players externos localmente, use o servidor HTTP do início do guia; abrir via `file://` pode impedir a identificação de origem exigida pelo YouTube. O link abaixo do player permite abrir o vídeo diretamente se o serviço bloquear a reprodução incorporada. [Player do YouTube](https://developers.google.com/youtube/player_parameters), [identificação e erros do player](https://developers.google.com/youtube/iframe_api_reference), [incorporação no Vimeo](https://help.vimeo.com/hc/en-us/articles/30100623447569-FAQ-Embedded-videos).

O workflow entregue já inclui tudo dentro de `assets/`, incluindo a pasta de vídeos. Nenhuma alteração no deploy é necessária. Na publicação manual, envie `assets/videos/` junto das imagens. Para atualizar, envie o novo vídeo e altere seu caminho em `data.js`.

## 3. Publicar pelo site do GitHub — opção simples

Esta opção não exige terminal nem GitHub Actions personalizado. GitHub Pages está disponível para repositórios públicos no GitHub Free. [Documentação oficial](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

1. Acesse sua conta no GitHub e escolha **New repository**.
2. Dê um nome, por exemplo `mta-resources`, escolha **Public** e crie o repositório.
3. Extraia o ZIP entregue. Entre na pasta `nexo-store`: o arquivo `index.html` deve ficar na raiz do repositório, não dentro de outra pasta `nexo-store`.
4. Em **Add file → Upload files**, envie `index.html`, a pasta `assets/` e `README.md`. Confirme em **Commit changes**. A pasta `assets` deve manter sua estrutura interna.
5. Crie também o arquivo vazio `.nojekyll` na raiz em **Add file → Create new file** e confirme a alteração. Esse arquivo já existe no ZIP, mas pode ficar oculto na seleção de arquivos do seu computador.
6. Para esta opção, não envie `.github/workflows/deploy-pages.yml`. Se já enviou, remova esse arquivo antes de usar publicação por branch.
7. Abra **Settings → Pages**. Em **Build and deployment → Source**, escolha **Deploy from a branch**; selecione **main** e **/(root)** e clique em **Save**.
8. Acompanhe a publicação na aba **Actions**. Quando terminar, consulte o endereço indicado em **Settings → Pages**.

O endereço de um projeto normalmente é `https://SEU-USUARIO.github.io/mta-resources/`. Se o repositório se chamar exatamente `SEU-USUARIO.github.io`, o endereço será `https://SEU-USUARIO.github.io/`. [Publicação por branch e seleção da pasta](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## 4. Publicar com GitHub Actions — opção automática

O projeto inclui `.github/workflows/deploy-pages.yml`. Ele publica somente `index.html`, `.nojekyll` e `assets/` quando você atualiza a branch `main`. Não há etapa de instalação ou compilação.

1. Envie **todo o conteúdo** de `nexo-store` para a raiz do repositório, incluindo `.github/workflows/deploy-pages.yml` e `.nojekyll`. Não envie a pasta externa que contém o projeto.
2. Se a pasta `.github` não aparecer no upload, use **Add file → Create new file**, informe `.github/workflows/deploy-pages.yml` e copie exatamente o conteúdo do arquivo entregue.
3. Em **Settings → Pages → Source**, escolha **GitHub Actions**.
4. Em **Actions**, selecione **Publicar vitrine no GitHub Pages** e clique em **Run workflow → Run workflow**. Depois disso, cada alteração enviada para `main` publica uma nova versão automaticamente.
5. Espere o processo concluir e abra o endereço em **Settings → Pages** ou no resultado do workflow.

Se a branch principal tiver outro nome, altere `branches: [main]` no workflow para esse nome. Não use simultaneamente esta opção e publicação por branch. O workflow usa as ações oficiais de Pages e as permissões necessárias para publicar. [Workflows oficiais do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

### Alternativa com Git (opcional)

Se já usa Git, abra o terminal na pasta `nexo-store`, crie um repositório vazio no GitHub e substitua os nomes abaixo antes de executar:

```sh
git init
git add .
git commit -m "Criar vitrine de resources"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

Conclua a configuração de **Settings → Pages → GitHub Actions** do passo anterior. O GitHub pode solicitar autenticação.

## 5. Atualizar pelo GitHub

1. No repositório, abra `assets/data.js` e clique no lápis (**Edit**).
2. Ajuste produtos, preços ou contatos e escolha **Commit changes**. Confirme a alteração em `main` ou faça o merge para `main` se usar outra branch.
3. Para novas imagens, use **Add file → Upload files** dentro de `assets/img/`; depois atualize o caminho do produto em `data.js`.
4. Espere a publicação concluir em **Actions** e atualize a página no navegador.

Para alterar aparência e textos gerais, edite `assets/styles.css` e `index.html`. Não há banco de dados para sincronizar. Você também pode editar localmente e usar `git add .`, `git commit -m "Atualizar catálogo"` e `git push`.

## 6. Conferir depois da publicação

- O catálogo abre e todas as imagens aparecem, inclusive no celular.
- O carrossel abre com o vídeo, avança pelas imagens no celular e no desktop e interrompe a reprodução ao mudar de mídia ou fechar os detalhes.
- Cada filtro, busca e ordenação funciona. A busca aceita nomes com ou sem acentos.
- Os detalhes abrem, fecham com Escape e têm o preço e os requisitos corretos.
- Um link de produto copiado abre o modal ao entrar diretamente no site.
- O contato mostra denardi e o ID correto, e o nome abre o perfil `https://discord.com/users/237549379702095872`.
- O aviso demonstrativo foi removido somente após a personalização completa.

Se a página mostrar 404, confira **Settings → Pages**, o término do deploy e a presença de `index.html` na raiz. Se uma imagem não aparecer, confira nome, extensão, maiúsculas e caminho. Se o catálogo desaparecer após editar `data.js`, revise aspas, vírgulas e chaves; o console do navegador ajuda a localizar um erro de sintaxe. Não coloque `/assets/...`: a barra inicial ignora a subpasta do repositório. Use `./assets/...`.

## Estrutura do projeto

```text
nexo-store/
├── index.html
├── README.md
├── .nojekyll
├── .gitignore
├── .github/workflows/deploy-pages.yml
└── assets/
    ├── data.js          # Marca, contatos, categorias e produtos
    ├── app.js           # Filtros, modais e links de contato
    ├── media.js         # Players locais, YouTube e Vimeo
    ├── media.css        # Apresentação de vídeos e galeria
    ├── videos/          # Vídeos locais e legendas .vtt
    ├── styles.css       # Identidade visual e versão mobile
    └── img/             # Previews locais e favicon
```

Todo o site é estático, sem bibliotecas JavaScript externas ou analytics próprios, e sem chamadas para carregar o catálogo. A tipografia General Sans é carregada pela API oficial do [Fontshare](https://www.fontshare.com/fonts/general-sans); sem internet, usa uma fonte do sistema. Para remover a fonte externa, retire o link do Fontshare e os dois preconnects em `index.html`. Os arquivos podem ser abertos localmente. Links de contato abrem serviços externos; players de YouTube/Vimeo se conectam aos respectivos serviços quando você inicia a reprodução. Vídeos locais funcionam com os arquivos do site.
