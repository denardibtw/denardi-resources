/* EDITE ESTE ARQUIVO para personalizar a loja. Não exige build nem backend.
 * Os produtos, preços, características e vídeos abaixo são exemplos.
 * Troque tudo pelo conteúdo real antes de desativar demoMode.
 * Vídeos: YouTube, Vimeo ou caminho relativo de arquivo .mp4/.webm/.ogv.
 * Os clipes incluídos são animações ilustrativas, não gravações de resources reais.
 * THUMBNAILS: você fornece a imagem. Em image, use ./assets/img/sua-thumbnail.webp.
 * Deixe image vazio enquanto não houver capa; nenhuma thumbnail será gerada.
 * CARROSSEL: image é a primeira imagem; acrescente outras em images, na ordem desejada.
 * images aceita caminhos ou objetos { src, alt, title }. O vídeo principal aparece antes das imagens.
 * Use aspas e vírgulas como nos exemplos. Os caminhos das imagens são relativos ao index.html.
 */
window.STORE_CONFIG = {
  name: "Denardi Resources",
  catalogTitle: "Scripts",
  packagesTitle: "Pacotes",
  pageTitle: "Denardi Resources",
  description: "Denardi Resources: resources e pacotes para MTA:SA. Explore os produtos, assista aos vídeos e fale com denardi para comprar.",
  demoMode: true,
  currency: "BRL",
  locale: "pt-BR",
  // Contato para compra: perfil, nome de usuário e ID do Discord.
  discordUrl: "https://discord.com/users/237549379702095872",
  discordUsername: "denardi",
  discordId: "237549379702095872", // Mantenha o ID entre aspas.
  home: {
    welcome: "Bem-vindo à",
    title: "DENARDI RESOURCES",
    description: "Conheça novas possibilidades para seu servidor. Confira vídeos, imagens e informações de cada resource antes de conversar sobre compatibilidade, licença e condições de compra.",
    heroImage: "./assets/img/home-city.webp", // Fundo decorativo. Pode trocar pela sua imagem.
    highlightProductId: "hud-essentials", // ID do produto apresentado com vídeo na home.
    highlightLabel: "EM DESTAQUE",
    featuredProductIds: ["hud-essentials", "inventario-grid", "garage-studio"],
  },
};

window.STORE_CATEGORIES = [
  { id: "interfaces", name: "Interfaces", icon: "layout" },
  { id: "sistemas", name: "Sistemas", icon: "layers" },
  { id: "veiculos", name: "Veículos", icon: "car" },
  { id: "mapas", name: "Mapas", icon: "map" },
];

/* PACOTES DEMONSTRATIVOS. Troque nomes, preço, licença e IDs pelos seus dados reais.
 * includedProducts reúne IDs de STORE_PRODUCTS. A economia é calculada pelo site.
 * license: "protected" (Código protegido) ou "open" (Código aberto).
 * image/images/videoUrl/extraVideos funcionam como nos resources individuais.
 * As licenças abaixo são exemplos de filtro, não condições reais de venda.
 */
window.STORE_PACKAGES = [
  {
    id: "interfaces", name: "Pacote Interfaces", price: 119.90, license: "open",
    includedProducts: ["hud-essentials", "login-flow"],
    image: "", imageAlt: "", images: [],
    description: "Uma proposta de identidade visual para a entrada e a experiência do jogador.",
    longDescription: "Pacote demonstrativo que reúne HUD Essentials e Login Flow. A combinação ilustra como apresentar várias interfaces em uma única oferta. As integrações e condições devem ser substituídas pelas informações reais dos seus resources.",
    features: ["HUD e tela de entrada reunidos", "Possibilidades de personalização a confirmar"],
    requirements: ["Confira os requisitos de cada resource incluído", "Compatibilidade entre os resources a confirmar"],
    delivery: "Exemplo de pacote. Confirme arquivos, licença de código aberto, instalação e suporte com denardi.",
    videoUrl: "./assets/videos/hud-demo.webm", videoTitle: "HUD do pacote · demonstração ilustrativa", videoCaptions: "./assets/videos/demo-pt.vtt",
    extraVideos: [], version: "1.0 · exemplo",
  },
  {
    id: "roleplay", name: "Pacote Roleplay", price: 299.90, license: "protected",
    includedProducts: ["inventario-grid", "city-bank", "garage-studio"],
    image: "", imageAlt: "", images: [],
    description: "Inventário, economia e garagem reunidos em uma apresentação para seu servidor.",
    longDescription: "Oferta demonstrativa com Inventário Grid, City Bank e Garage Studio. Mostra como agrupar recursos ligados à rotina de um servidor roleplay. Não representa um pacote real nem uma integração já disponível; personalize com as funções verdadeiras.",
    features: ["Três propostas de sistemas em uma oferta", "Integração com o gamemode a definir"],
    requirements: ["Confira os requisitos dos três resources", "Sistema de contas e persistência a confirmar"],
    delivery: "Exemplo de pacote. Confirme licença de código protegido, arquivos, dependências e suporte.",
    videoUrl: "./assets/videos/inventory-demo.webm", videoTitle: "Inventário do pacote · demonstração ilustrativa", videoCaptions: "./assets/videos/demo-pt.vtt",
    extraVideos: [], version: "1.0 · exemplo",
  },
  {
    id: "servidor", name: "Pacote Servidor", price: 479.90, license: "protected",
    includedProducts: ["hud-essentials", "inventario-grid", "garage-studio", "login-flow", "city-bank", "district-map"],
    image: "", imageAlt: "", images: [],
    description: "Uma coleção de interfaces, sistemas e mapa para apresentar sua oferta mais completa.",
    longDescription: "Coleção demonstrativa dos seis resources deste catálogo. Use este exemplo para organizar uma oferta maior, indicando com clareza o que está incluído, as dependências e as condições de uso. Não há promessa de compatibilidade automática entre estes exemplos.",
    features: ["Seis resources demonstrativos reunidos", "Escopo e instalação a confirmar"],
    requirements: ["Requisitos de todos os resources incluídos", "Compatibilidade conjunta a validar com o criador"],
    delivery: "Exemplo de pacote. Informe os arquivos, licença, prazo e condições reais de entrega.",
    videoUrl: "", extraVideos: [], version: "1.0 · exemplo",
  },
  {
    id: "economia", name: "Pacote Economia", price: 199.90, license: "open",
    includedProducts: ["inventario-grid", "city-bank"],
    image: "", imageAlt: "", images: [],
    description: "Itens e interface bancária em uma proposta de sistemas para roleplay.",
    longDescription: "Pacote demonstrativo com Inventário Grid e City Bank. A lista de componentes ajuda o visitante a avaliar uma oferta conjunta. Valores, funcionalidades e licença de código aberto são exemplos e precisam refletir seus produtos reais.",
    features: ["Inventário e banco reunidos", "Regras de economia a definir"],
    requirements: ["Sistema de itens e economia a integrar", "Persistência e validações a confirmar"],
    delivery: "Exemplo: dois resources e instruções. Confirme licença, integração e suporte antes de comprar.",
    videoUrl: "", extraVideos: [], version: "1.0 · exemplo",
  },
  {
    id: "cidade", name: "Pacote Cidade", price: 179.90, license: "protected",
    includedProducts: ["garage-studio", "district-map"],
    image: "", imageAlt: "", images: [],
    description: "Garagem e ambientação urbana para apresentar novas possibilidades no servidor.",
    longDescription: "Combinação demonstrativa de Garage Studio e District Map. Substitua por seus resources e informe as áreas do mapa, os sistemas de veículos e as integrações necessárias. As capas serão adicionadas por você.",
    features: ["Garagem e mapa reunidos", "Compatibilidade com o cenário a definir"],
    requirements: ["Sistema de veículos a integrar", "Compatibilidade com outros mapas a confirmar"],
    delivery: "Exemplo de pacote. Confirme arquivos do mapa, licença, dependências e instalação.",
    videoUrl: "", extraVideos: [], version: "1.0 · exemplo",
  },
  {
    id: "inicial", name: "Pacote Inicial", price: 229.90, license: "open",
    includedProducts: ["hud-essentials", "login-flow", "inventario-grid"],
    image: "", imageAlt: "", images: [],
    description: "Entrada, HUD e inventário em uma coleção demonstrativa de três resources.",
    longDescription: "Exemplo de oferta com HUD Essentials, Login Flow e Inventário Grid. Personalize a composição e descreva a experiência real de cada componente antes de divulgar este pacote. A economia exibida compara os preços demonstrativos do catálogo.",
    features: ["Três propostas de interface e sistema", "Personalização de marca a confirmar"],
    requirements: ["Integração com contas e sistema de itens", "Confira os requisitos individuais antes da compra"],
    delivery: "Exemplo de pacote. Confirme código aberto, arquivos entregues, instalação e suporte.",
    videoUrl: "", extraVideos: [], version: "1.0 · exemplo",
  },
];

window.STORE_PRODUCTS = [
  {
    id: "hud-essentials", name: "HUD Essentials", category: "interfaces", price: 79.90,
    image: "", imageAlt: "", // Adicione o caminho da sua thumbnail e sua descrição.
    images: [], // Outras imagens do resource: { src: "./assets/img/arquivo.webp", alt: "Descrição" }.
    badge: "Em destaque", featured: true, version: "1.0 · exemplo",
    description: "Informações essenciais, uma interface que faz a diferença.",
    longDescription: "Conceito demonstrativo de HUD para organizar vida, armadura, saldo e informações do veículo em uma interface limpa. Substitua esta descrição pelas funcionalidades reais do seu resource.",
    features: ["Indicadores de vida e armadura", "Velocímetro com marcador circular", "Conceito de minimapa e localização", "Layout com cores personalizáveis"],
    requirements: ["MTA:SA — versão a confirmar", "Integração com gamemode a confirmar", "Dependências a informar pelo criador"],
    delivery: "Exemplo: arquivos do resource e instruções. Confirme licença, instalação e suporte com o criador.",
    tags: ["HUD", "Interface"],
    videoUrl: "./assets/videos/hud-demo.webm", // Troque pelo seu YouTube, Vimeo ou arquivo local.
    videoTitle: "Visão geral do HUD · ilustrativo",
    videoCaptions: "./assets/videos/demo-pt.vtt", // Opcional, para vídeos locais.
    extraVideos: [ // Opcional: quantos vídeos adicionais precisar.
      { title: "Detalhes da interface · ilustrativo", url: "./assets/videos/hud-details.webm", captions: "./assets/videos/demo-pt.vtt" },
    ],
  },
  {
    id: "inventario-grid", name: "Inventário Grid", category: "sistemas", price: 149.90,
    image: "", imageAlt: "", // Adicione o caminho da sua thumbnail e sua descrição.
    images: [], // Outras imagens do resource: { src: "./assets/img/arquivo.webp", alt: "Descrição" }.
    badge: "", featured: true, version: "1.0 · exemplo",
    description: "Um lugar para cada item. Mais possibilidades para o roleplay.",
    longDescription: "Conceito demonstrativo de inventário em grade, com espaços para itens, peso e informações de uso. As funções descritas são exemplos para apresentar um produto real posteriormente.",
    features: ["Grade visual de itens", "Exemplo de limite de peso", "Informações e ações por item", "Organização por tipo de item"],
    requirements: ["MTA:SA — versão a confirmar", "Sistema de itens a definir", "Persistência de dados a confirmar"],
    delivery: "Exemplo: arquivos e guia de integração. Confirme as condições de entrega com o criador.",
    tags: ["Roleplay", "Inventário"], videoUrl: "./assets/videos/inventory-demo.webm",
    videoTitle: "Conceito de inventário · ilustrativo", videoCaptions: "./assets/videos/demo-pt.vtt",
  },
  {
    id: "garage-studio", name: "Garage Studio", category: "veiculos", price: 119.90,
    image: "", imageAlt: "", // Adicione o caminho da sua thumbnail e sua descrição.
    images: [], // Outras imagens do resource: { src: "./assets/img/arquivo.webp", alt: "Descrição" }.
    badge: "", featured: false, version: "1.0 · exemplo",
    description: "Seus veículos em uma garagem com uma nova perspectiva.",
    longDescription: "Conceito demonstrativo de painel de garagem para seleção de veículos. Substitua esta descrição pelas funcionalidades reais do seu resource.",
    features: ["Seleção visual de veículos", "Informações por veículo", "Exemplo de categorias", "Painel de ações da garagem"],
    requirements: ["MTA:SA — versão a confirmar", "Sistema de propriedade de veículos a integrar", "Banco de dados a confirmar"],
    delivery: "Exemplo: interface e arquivos de integração. Modelos de veículos não estão incluídos neste exemplo.",
    tags: ["Garagem", "Veículos"], videoUrl: "",
  },
  {
    id: "login-flow", name: "Login Flow", category: "interfaces", price: 59.90,
    image: "", imageAlt: "", // Adicione o caminho da sua thumbnail e sua descrição.
    images: [], // Outras imagens do resource: { src: "./assets/img/arquivo.webp", alt: "Descrição" }.
    badge: "", featured: false, version: "1.0 · exemplo",
    description: "A primeira impressão do seu servidor, repensada.",
    longDescription: "Conceito demonstrativo de tela de acesso e apresentação do servidor, com área para identidade visual. Não há autenticação funcional neste site ou no preview.",
    features: ["Layout de entrada e cadastro", "Espaço para a marca do servidor", "Exemplo de mensagens de formulário", "Composição com painel de apresentação"],
    requirements: ["MTA:SA — versão a confirmar", "Sistema de contas a integrar", "Regras de autenticação a definir"],
    delivery: "Exemplo: layout e arquivos de interface. Confirme a integração com o sistema de contas real.",
    tags: ["Login", "Interface"], videoUrl: "",
  },
  {
    id: "city-bank", name: "City Bank", category: "sistemas", price: 99.90,
    image: "", imageAlt: "", // Adicione o caminho da sua thumbnail e sua descrição.
    images: [], // Outras imagens do resource: { src: "./assets/img/arquivo.webp", alt: "Descrição" }.
    badge: "", featured: false, version: "1.0 · exemplo",
    description: "Uma interface bancária para dar vida à economia do jogo.",
    longDescription: "Conceito demonstrativo de painel de banco para um servidor de roleplay. Saldos e transações do preview são fictícios e não representam um sistema financeiro real.",
    features: ["Resumo visual de saldo", "Exemplo de histórico de movimentações", "Layout de depósito e saque", "Painel de transferência ilustrativo"],
    requirements: ["MTA:SA — versão a confirmar", "Sistema de economia a integrar", "Validações no servidor a confirmar"],
    delivery: "Exemplo: interface e guia de integração. Confirme persistência, permissões e segurança do resource real.",
    tags: ["Economia", "Roleplay"], videoUrl: "",
  },
  {
    id: "district-map", name: "District Map", category: "mapas", price: 89.90,
    image: "", imageAlt: "", // Adicione o caminho da sua thumbnail e sua descrição.
    images: [], // Outras imagens do resource: { src: "./assets/img/arquivo.webp", alt: "Descrição" }.
    badge: "", featured: false, version: "1.0 · exemplo",
    description: "Novos pontos de encontro. Novas histórias para criar.",
    longDescription: "Conceito demonstrativo de apresentação de um mapa urbano, com pontos de interesse. Substitua por informações do seu mapa, incluindo localização e objetos utilizados.",
    features: ["Proposta de ambientação urbana", "Pontos de interesse ilustrativos", "Composição com ruas e quarteirões", "Identidade visual do distrito"],
    requirements: ["MTA:SA — versão a confirmar", "Localização e dimensão a definir", "Compatibilidade com outros mapas a confirmar"],
    delivery: "Exemplo: arquivos de mapa e instruções. Confirme objetos, colisões e dependências reais com o criador.",
    tags: ["Mapa", "Ambientação"], videoUrl: "",
  },
];
