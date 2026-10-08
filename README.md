# Denardi Resources

**Loja:** https://denardibtw.github.io/denardi-resources/  
**Painel:** https://denardibtw.github.io/denardi-resources/admin.html  
**Repositório:** https://github.com/denardibtw/denardi-resources

Loja/portfólio estática em português para resources de MTA:SA. Inclui home, produtos, pacotes, categorias, busca, preços e detalhes com carrossel: **um vídeo → thumbnail → imagens**. A compra é combinada com **denardi**, ID **237549379702095872**, pelo [Discord](https://discord.com/users/237549379702095872). Não há checkout, backend ou cadastro de clientes.

Os seis produtos e seis pacotes iniciais são exemplos editáveis. Nomes, preços, funcionalidades e clipes não representam ofertas reais do usuário. Os clipes locais são animações ilustrativas, não gravações de resources em execução. Substitua esses dados pelo seu catálogo antes de anunciar ofertas. Os avisos globais de demonstração estão desativados conforme solicitado; isso não transforma os exemplos em produtos reais.

## Usar o painel

1. Abra o link do **Painel** acima.
2. Em **Produtos**, escolha um item ou clique em **+ Novo produto**.
3. Preencha título, categoria, preço, descrições e o link do seu vídeo. Há um único vídeo por produto.
4. Em **Enviar sua thumbnail**, selecione a capa que você preparou. Em **Enviar imagens**, acrescente imagens da galeria; use as setas para ordenar. Também pode informar URLs HTTPS.
5. Abra **Funcionalidades, requisitos e entrega** para configurar versão, tags, dependências, condições de entrega e informações adicionais.
6. Clique em **Salvar produto** ou **Salvar rascunho**.
7. Use **Ver prévia** para conferir a loja com o rascunho.
8. Quando estiver pronto, clique em **Publicar** e siga a configuração abaixo.

**Salvar rascunho** guarda alterações e imagens somente neste navegador. **Publicar** envia o catálogo e as novas imagens ao GitHub, que atualiza o site pelo Pages. A prévia não altera o que os compradores veem. Rascunhos não são sincronizados entre computadores ou navegadores; faça backup antes de limpar os dados do navegador.

### Produto vendido

Marque **Marcar como vendido** e publique. O item continua no catálogo com apresentação atenuada e etiqueta **Vendido**. Vídeo e imagens continuam acessíveis, mas o botão de compra fica desativado como **Vendido**. Desmarque e publique para disponibilizá-lo novamente. Isso também funciona para pacotes.

### Pacotes, categorias e home

- **Pacotes:** configure preço, licença, resources incluídos, um vídeo, thumbnail, galeria e disponibilidade. A economia é calculada com os preços atuais dos resources incluídos.
- **Categorias:** edite nomes, identificadores e ícones. Renomear o identificador atualiza os produtos da categoria. Antes de excluir uma categoria em uso, reatribua seus produtos.
- **Loja e home:** personalize marca, títulos, descrição, Discord, fundo e produtos em destaque.

Preserve o identificador depois de compartilhar um link. Ele cria endereços como `#resource/meu-resource` ou `#pacote/meu-pacote`. Excluir um produto do rascunho também remove suas referências dos pacotes e destaques; a exclusão só entra no site ao publicar.

### Preparar a publicação direta

O painel publica em **denardibtw/denardi-resources**, branch **main**. O GitHub verifica o acesso de escrita. A URL do painel não é privada: visitantes podem criar rascunhos em seus próprios navegadores, mas somente um token autorizado consegue alterar o repositório.

1. Entre na sua conta e abra [Fine-grained personal access tokens](https://github.com/settings/personal-access-tokens/new).
2. Escolha **denardibtw** como proprietário e uma validade curta conveniente para você.
3. Em **Repository access**, selecione **Only select repositories** e apenas **denardi-resources**.
4. Em **Repository permissions**, configure **Contents: Read and write**. **Metadata** permanece somente leitura. Não precisa permitir edição de workflows.
5. Crie o token por conta própria. Cole-o somente no campo de publicação do painel; não envie pelo chat.
6. Clique em **Publicar no GitHub**. O campo é limpo ao iniciar a operação. O token é usado durante essa publicação e não entra no rascunho, no backup ou nos arquivos da loja.
7. O painel confirma o envio e oferece um link para **Actions**. Aguarde **Publicar vitrine no GitHub Pages** concluir e abra a loja.

[Guia oficial de tokens do GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).

Catálogo e imagens são enviados em uma única atualização. Os demais arquivos são preservados. Se o catálogo mudou em outra sessão, o painel interrompe a publicação para evitar sobrescrever alterações. Exporte seu rascunho, use **Carregar versão publicada** e reaplique as mudanças. Carregar a versão publicada pede confirmação quando houver um rascunho diferente da base.

Se o token expirou ou não tem acesso, prepare outro. Se o envio terminou mas o site ainda não mudou, confira **Actions**: enviar ao repositório e concluir o deploy são etapas diferentes. O painel não guarda seu token para consultas posteriores.

### Backup e alternativa sem token

**Exportar backup e arquivos** baixa um ZIP com:

- `panel-backup.json`: catálogo e base do rascunho;
- `assets/data.js`: catálogo pronto para publicação;
- `assets/img/uploads/`: imagens adicionadas neste painel e usadas no catálogo.

**Importar backup** restaura esse ZIP ou o JSON. O ZIP importável é o produzido pelo próprio painel. Arquivos já existentes no repositório e imagens externas permanecem referenciados e não são baixados no backup. O arquivo exportado não contém token.

Para publicar manualmente, extraia o backup e envie `assets/data.js` e as novas imagens às pastas correspondentes no GitHub, preservando os nomes. Use uma branch e faça o merge depois de enviar todos os arquivos. Atualizar `main` inicia o deploy.

## Vídeo e imagens

Cada produto/pacote usa **um único `videoUrl`**. São aceitos YouTube, Vimeo, arquivos em `assets/videos/` e URLs HTTPS diretas de MP4, WebM ou OGV. Para gravações longas, YouTube/Vimeo mantêm o repositório leve. O vídeo precisa permitir incorporação; o player também oferece um link para abrir a gravação diretamente.

O carrossel começa pelo vídeo, seguido da thumbnail e da galeria. Sem vídeo, começa pelas imagens. Fechar os detalhes ou mudar de mídia interrompe a reprodução. Players externos carregam somente depois do clique. Não há geração de thumbnails ou extração automática de capas.

O painel envia **imagens**, não arquivos de vídeo. Para vídeo local, envie-o pelo GitHub para `assets/videos/` e informe, por exemplo, `./assets/videos/meu-resource.mp4`. Prefira imagens em 16:9, como 1280 × 720 px. São aceitos PNG, JPG, WebP e GIF de até 10 MB cada, sem alterar sua arte.

[Player do YouTube](https://developers.google.com/youtube/player_parameters), [incorporação no Vimeo](https://help.vimeo.com/hc/en-us/articles/30100623447569-FAQ-Embedded-videos).

## Abrir localmente

A vitrine pode ser aberta pelo `index.html`. Para painel, rascunhos e prévia, use um servidor HTTP. Se já tiver Python, abra a pasta do projeto e execute:

```sh
python -m http.server 8000
```

Acesse `http://localhost:8000/` e `http://localhost:8000/admin.html`. Para parar, pressione `Ctrl+C`. Não é necessário instalar dependências ou compilar para publicar.

## Publicar no GitHub Pages

O repositório atual já usa GitHub Actions. O endereço acompanha o nome **denardi-resources**; o antigo `/denardidev/` não redireciona automaticamente no Pages.

Para publicar uma cópia em outro repositório:

1. Crie um repositório público.
2. Extraia `denardi-resources.zip`. Envie **o conteúdo da pasta** à raiz: `index.html`, `admin.html`, `assets/`, `.nojekyll`, `README.md` e `.github/workflows/deploy-pages.yml`.
3. Se a pasta `.github` não aparecer no upload, use **Add file → Create new file**, informe `.github/workflows/deploy-pages.yml` e copie o arquivo entregue.
4. Em **Settings → Pages → Source**, selecione **GitHub Actions**.
5. Em **Actions**, abra **Publicar vitrine no GitHub Pages** e execute **Run workflow**. As próximas alterações em `main` iniciam o deploy.
6. Espere concluir e consulte o endereço em **Settings → Pages**.

O workflow publica `index.html`, `admin.html`, `.nojekyll` e todo `assets/`. Os caminhos relativos funcionam em subpastas como `https://USUARIO.github.io/REPOSITORIO/`.

Para outro repositório, ajuste proprietário/repositório/branch em `assets/admin-github.js`, os links e identificação em `admin.html` e este guia. Se a branch não for `main`, ajuste o workflow.

[Criação de um site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site), [workflows oficiais](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

Alternativa: use **Settings → Pages → Deploy from a branch → main → /(root)**, enviando os arquivos públicos e `.nojekyll`. Não use simultaneamente essa opção e o workflow personalizado.

## Personalização por arquivos

O painel é a forma recomendada para editar o catálogo. Para editar `assets/data.js` manualmente, preserve o formato gerado: quatro atribuições `window.STORE_CONFIG`, `window.STORE_CATEGORIES`, `window.STORE_PRODUCTS` e `window.STORE_PACKAGES`, com valores JSON válidos. O painel lê JSON sem executar arquivos importados.

| Campo | Uso |
| --- | --- |
| `id`, `name`, `category` | Identificador do link, título e ID da categoria. |
| `price`, `sold`, `featured` | Preço numérico, vendido e destaque. |
| `description`, `longDescription` | Texto da vitrine e detalhes. |
| `image`, `imageAlt`, `images` | Thumbnail, descrição acessível e galeria. |
| `videoUrl`, `videoTitle` | Único vídeo e título. |
| `videoPoster`, `videoCaptions` | Capa opcional e legendas WebVTT. |
| `features`, `requirements`, `delivery`, `version`, `tags` | Funcionamento e entrega. |
| `includedProducts`, `license` | Composição do pacote e licença `open`/`protected`. |

O campo legado `extraVideos` fica vazio e é ignorado. Use preços como `79.90`, IDs sem espaços e Discord ID como texto entre aspas. Use `./assets/...`, sem barra inicial. Maiúsculas/minúsculas fazem diferença no Pages.

O visual fica em `assets/styles.css`, `home.css` e `packages.css`. Navegação, rodapé e dúvidas gerais ficam em `index.html`; ajuste licença, entrega e suporte às condições reais. `brand.svg` e `favicon.svg` contêm o monograma DR.

A composição segue as referências de [home](https://www.vames-store.com/), [catálogo](https://www.vames-store.com/category/2092562) e [pacotes](https://www.vames-store.com/category/2100161). O fundo decorativo `assets/img/home-city.webp` veio da home indicada; substitua-o pelo seu material se desejar. Não é uma captura de um resource seu.

## Conferir uma atualização

- Confira títulos, preços e condições reais.
- Teste busca, categorias, links individuais e o celular.
- Veja o vídeo, avance pelas imagens e feche os detalhes para conferir a interrupção.
- Na prévia, marque um item como vendido: ele continua acessível sem compra.
- Aguarde o deploy em **Actions** antes de divulgar uma atualização.

Se houver 404, confira o deploy e `index.html` na raiz. Se uma imagem falhar, revise caminho, extensão e maiúsculas. Se uma edição manual quebrar o catálogo, revise o JSON. Se o navegador não salvar rascunhos, confira armazenamento e exporte um backup.

## Estrutura

```text
denardi-resources/
├── index.html
├── admin.html
├── README.md
├── .nojekyll
├── .github/workflows/deploy-pages.yml
└── assets/
    ├── data.js
    ├── app.js / media.js
    ├── styles.css / home.css / packages.css / media.css / sold.css
    ├── admin.js / admin.css
    ├── admin-model.js / admin-storage.js / admin-github.js / admin-zip.js
    ├── store-preview.js
    ├── img/
    └── videos/
```

A vitrine usa o catálogo incluído no site. Somente o painel consulta a API do GitHub para ler/publicar. Não há bibliotecas JavaScript externas nem analytics próprios. General Sans vem do [Fontshare](https://www.fontshare.com/fonts/general-sans); sem ela, usa a fonte do sistema. Players externos se conectam aos respectivos serviços quando iniciados.
