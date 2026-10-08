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
  name: "Denardi Dev - Resources MTA:SA",
  catalogTitle: "Scripts",
  pageTitle: "Denardi Dev - Resources MTA:SA",
  description: "Vitrine de resources para MTA:SA. Explore o catálogo e fale com o criador para comprar.",
  demoMode: true,
  currency: "BRL",
  locale: "pt-BR",
  // Contato para compra: perfil, nome de usuário e ID do Discord.
  discordUrl: "https://discord.com/users/237549379702095872",
  discordUsername: "denardi",
  discordId: "237549379702095872", // Mantenha o ID entre aspas.
  home: {
    welcome: "Bem-vindo à",
    title: "DENARDI DEV",
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
