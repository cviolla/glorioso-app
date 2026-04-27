export type MenuItemVariant = {
  name: string;
  price: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  variants?: MenuItemVariant[];
  addons?: MenuItemVariant[];
  imageUrl?: string;
};

export type MenuCategory = {
  id: string;
  name: string;
  subcategories?: {
    name: string;
    items: MenuItem[];
  }[];
  items?: MenuItem[];
};

export const artesanalAddons = [
  { name: 'BACON', price: 3.00 },
  { name: 'BLEND 180g', price: 9.00 },
  { name: 'OVO', price: 2.00 },
  { name: 'CREME DE CHEDDAR', price: 4.00 },
  { name: 'ONION RINGS', price: 3.00 },
];

export const traditionalAddons = [
  { name: 'CARNE', price: 3.00 },
  { name: 'OVO', price: 2.00 },
  { name: 'BACON', price: 2.00 },
];

export const menuData: MenuCategory[] = [
  {
    id: 'artesanais',
    name: 'ARTESANAIS',
    items: [
      { id: 'valente-gloria', name: 'VALENTE DE GLÓRIA', description: 'blend 180g, costela desfiada, cream cheese, queijo, molho especial, pão de brioche', price: 26.00, addons: artesanalAddons },
      { id: 'conquistador', name: 'O CONQUISTADOR', description: 'blend 180g, bacon, ovo, queijo, molho especial, pão brioche', price: 23.00, addons: artesanalAddons },
      { id: 'golpe-gloria', name: 'GOLPE DE GLÓRIA', description: 'blend 180g, onion rings, bacon, queijo, molho especial, pão de brioche', price: 25.00, addons: artesanalAddons },
      { id: 'escolhido', name: 'O ESCOLHIDO', description: 'blend 180g, creme de cheddar especial, fatiado de cheddar, molho especial, pão de brioche', price: 21.00, addons: artesanalAddons },
      { id: 'gloria-suprema', name: 'GLÓRIA SUPREMA', description: 'blend 180g, queijo empanado, bacon, molho especial, pão de brioche', price: 28.00, addons: artesanalAddons },
    ]
  },
  {
    id: 'hamburguer',
    name: 'HAMBURGUER',
    items: [
      { id: 'x-burguer', name: 'X-BURGUER', description: 'pão, carne, queijo, salada, molho especial e batata filetada', price: 7.50, addons: traditionalAddons },
      { id: 'x-egg', name: 'X-EGG', description: 'pão, carne, queijo, presunto, ovo, salada, molho especial e batata filetada', price: 11.00, addons: traditionalAddons },
      { id: 'x-bacon', name: 'X-BACON', description: 'pão, carne, queijo, presunto, bacon, salada, molho especial e batata filetada', price: 11.00, addons: traditionalAddons },
      { id: 'x-tudo', name: 'X-TUDO', description: 'pão, carne, queijo, presunto, ovo, bacon, salada, molho especial e batata filetada', price: 13.00, addons: traditionalAddons },
      { id: 'cheddar-bacon', name: 'CHEDDAR BACON', description: 'pão, carne, queijo cheddar, salada, molho especial e batata filetada', price: 10.00, addons: traditionalAddons },
      { id: 'x-tudo-duplo', name: 'X-TUDO DUPLO', description: 'pão, 2 carnes, 2 queijos, 2 presuntos, ovo, bacon, salada, molho especial e batata filetada', price: 15.00, addons: traditionalAddons },
      { id: 'duplo-cheddar-bacon', name: 'DUPLO CHEDDAR BACON', description: 'pão, 2 carnes, 2 queijos cheddar, salada, molho especial e batata filetada', price: 15.00, addons: traditionalAddons },
      { id: 'x-tudo-picanha', name: 'X-TUDO PICANHA', description: 'pão, carne, queijo, presunto, ovo, bacon, salada, molho especial e batata filetada', price: 15.00, addons: traditionalAddons },
    ]
  },
  {
    id: 'batatas',
    name: 'BATATAS',
    items: [
      { id: 'batata-cheddar-bacon', name: 'CHEDDAR + BACON', price: 20.00 },
      { id: 'batata-mussa-calabresa', name: 'MUSSARELA + CALABRESA', price: 20.00 },
      { id: 'batata-costela-cream', name: 'COSTELA + CREAM CHEESE', price: 22.00 },
      { id: 'batata-pequena', name: 'PEQUENA', price: 8.00 },
    ]
  },
  {
    id: 'pizzas',
    name: 'PIZZAS',
    items: [
      { id: 'pizza-mussarela', name: 'MUSSARELA', description: 'ESCOLHA ATÉ 2 SABORES', variants: [{ name: '25CM', price: 25.00 }, { name: '30CM', price: 32.00 }, { name: '35CM', price: 41.00 }] },
      { id: 'pizza-calabresa', name: 'CALABRESA', description: 'ESCOLHA ATÉ 2 SABORES', variants: [{ name: '25CM', price: 25.00 }, { name: '30CM', price: 32.00 }, { name: '35CM', price: 41.00 }] },
      { id: 'pizza-presunto', name: 'PRESUNTO', description: 'ESCOLHA ATÉ 2 SABORES', variants: [{ name: '25CM', price: 25.00 }, { name: '30CM', price: 32.00 }, { name: '35CM', price: 41.00 }] },
      { id: 'pizza-frango-catupiry', name: 'FRANGO COM CATUPIRY', description: 'ESCOLHA ATÉ 2 SABORES', variants: [{ name: '25CM', price: 26.00 }, { name: '30CM', price: 34.00 }, { name: '35CM', price: 41.00 }] },
      { id: 'pizza-bacon', name: 'BACON', description: 'ESCOLHA ATÉ 2 SABORES', variants: [{ name: '25CM', price: 28.00 }, { name: '30CM', price: 38.00 }, { name: '35CM', price: 45.00 }] },
      { id: 'pizza-bacon-ovos', name: 'BACON COM OVOS', description: 'ESCOLHA ATÉ 2 SABORES', variants: [{ name: '25CM', price: 28.00 }, { name: '30CM', price: 38.00 }, { name: '35CM', price: 45.00 }] },
      { id: 'pizza-queijo-bacon', name: 'QUEIJO MINAS + BACON', description: 'ESCOLHA ATÉ 2 SABORES', variants: [{ name: '25CM', price: 28.00 }, { name: '30CM', price: 38.00 }, { name: '35CM', price: 45.00 }] },
      { id: 'pizza-carne-seca', name: 'CARNE SECA', description: 'ESCOLHA ATÉ 2 SABORES', variants: [{ name: '25CM', price: 30.00 }, { name: '30CM', price: 40.00 }, { name: '35CM', price: 50.00 }] },
      { id: 'pizza-camarao', name: 'CAMARÃO', description: 'ESCOLHA ATÉ 2 SABORES', variants: [{ name: '25CM', price: 30.00 }, { name: '30CM', price: 40.00 }, { name: '35CM', price: 50.00 }] },
      { id: 'pizza-portuguesa', name: 'PORTUGUESA', description: 'ESCOLHA ATÉ 2 SABORES', variants: [{ name: '25CM', price: 30.00 }, { name: '30CM', price: 40.00 }, { name: '35CM', price: 50.00 }] },
    ]
  },
  {
    id: 'massas',
    name: 'MASSAS',
    subcategories: [
      {
        name: 'PANQUECAS',
        items: [
          { id: 'panqueca-camarao', name: 'CAMARÃO', variants: [{ name: 'PEQUENA', price: 10.0 }, { name: 'MÉDIA', price: 25.0 }, { name: 'GRANDE', price: 45.0 }] },
          { id: 'panqueca-carne', name: 'CARNE', variants: [{ name: 'PEQUENA', price: 10.0 }, { name: 'MÉDIA', price: 25.0 }, { name: 'GRANDE', price: 45.0 }] },
          { id: 'panqueca-frango', name: 'FRANGO', variants: [{ name: 'PEQUENA', price: 10.0 }, { name: 'MÉDIA', price: 25.0 }, { name: 'GRANDE', price: 45.0 }] },
        ]
      },
      {
        name: 'NHOQUE',
        items: [
          { id: 'nhoque-camarao', name: 'CAMARÃO', variants: [{ name: 'PEQUENA', price: 10.0 }, { name: 'MÉDIA', price: 25.0 }, { name: 'GRANDE', price: 45.0 }] },
          { id: 'nhoque-carne', name: 'CARNE', variants: [{ name: 'PEQUENA', price: 10.0 }, { name: 'MÉDIA', price: 25.0 }, { name: 'GRANDE', price: 45.0 }] },
          { id: 'nhoque-frango', name: 'FRANGO', variants: [{ name: 'PEQUENA', price: 10.0 }, { name: 'MÉDIA', price: 25.0 }, { name: 'GRANDE', price: 45.0 }] },
          { id: 'nhoque-carne-seca', name: 'CARNE SECA', variants: [{ name: 'PEQUENA', price: 10.0 }, { name: 'MÉDIA', price: 25.0 }, { name: 'GRANDE', price: 45.0 }] },
        ]
      },
      {
        name: 'ESCONDIDINHO',
        items: [
          { id: 'escondidinho-camarao', name: 'CAMARÃO', variants: [{ name: 'PEQUENA', price: 10.0 }, { name: 'MÉDIA', price: 25.0 }, { name: 'GRANDE', price: 45.0 }] },
          { id: 'escondidinho-carne', name: 'CARNE', variants: [{ name: 'PEQUENA', price: 10.0 }, { name: 'MÉDIA', price: 25.0 }, { name: 'GRANDE', price: 45.0 }] },
          { id: 'escondidinho-frango', name: 'FRANGO', variants: [{ name: 'PEQUENA', price: 10.0 }, { name: 'MÉDIA', price: 25.0 }, { name: 'GRANDE', price: 45.0 }] },
          { id: 'escondidinho-carne-seca', name: 'CARNE SECA', variants: [{ name: 'PEQUENA', price: 10.0 }, { name: 'MÉDIA', price: 25.0 }, { name: 'GRANDE', price: 45.0 }] },
        ]
      },
      {
        name: 'LASANHA',
        items: [
          { id: 'lasanha-camarao', name: 'CAMARÃO', variants: [{ name: 'PEQUENA', price: 10.0 }, { name: 'MÉDIA', price: 25.0 }, { name: 'GRANDE', price: 45.0 }] },
          { id: 'lasanha-carne', name: 'CARNE', variants: [{ name: 'PEQUENA', price: 10.0 }, { name: 'MÉDIA', price: 25.0 }, { name: 'GRANDE', price: 45.0 }] },
          { id: 'lasanha-frango', name: 'FRANGO', variants: [{ name: 'PEQUENA', price: 10.0 }, { name: 'MÉDIA', price: 25.0 }, { name: 'GRANDE', price: 45.0 }] },
          { id: 'lasanha-queijo-presunto', name: 'QUEIJO COM PRESUNTO', variants: [{ name: 'PEQUENA', price: 10.0 }, { name: 'MÉDIA', price: 25.0 }, { name: 'GRANDE', price: 45.0 }] },
          { id: 'lasanha-carne-seca', name: 'CARNE SECA', variants: [{ name: 'PEQUENA', price: 10.0 }, { name: 'MÉDIA', price: 25.0 }, { name: 'GRANDE', price: 45.0 }] },
        ]
      }
    ]
  },
  {
    id: 'salgados',
    name: 'SALGADOS',
    subcategories: [
      {
        name: 'FRITOS',
        items: [
          { id: 'coxinha', name: 'COXINHA', price: 1.50 },
          { id: 'risole-camarao', name: 'RISOLE DE CAMARÃO', price: 2.00 },
          { id: 'quibe', name: 'QUIBE', price: 1.50 },
          { id: 'bolinho-aipim', name: 'BOLINHO DE AIPIM', price: 2.50 },
          { id: 'enroladinho-salsicha', name: 'ENROLADINHO DE SALSICHA', price: 1.50 },
          { id: 'queijo-presunto', name: 'QUEIJO COM PRESUNTO', price: 1.50 },
          { id: 'queijo-alho', name: 'QUEIJO COM ALHO', price: 1.50 },
          { id: 'bolinha-queijo', name: 'BOLINHA DE QUEIJO', price: 1.50 },
        ]
      },
      {
        name: 'MINI ASSADOS',
        items: [
          { id: 'mini-joelho-qp', name: 'JOELHO DE QUEIJO COM PRESUNTO', price: 1.00 },
          { id: 'mini-joelho-frango', name: 'JOELHO DE FRANGO COM REQUEIJÃO', price: 1.00 },
          { id: 'empadinha', name: 'EMPADINHA', price: 1.00 },
        ]
      },
      {
        name: 'ASSADOS GRANDES',
        items: [
          { id: 'joelho-qp', name: 'JOELHO DE QUEIJO COM PRESUNTO', price: 5.00 },
          { id: 'joelho-frango', name: 'JOELHO DE FRANGO COM REQUEIJÃO', price: 5.00 },
          { id: 'hamburguer-forno', name: 'HAMBURGUER DE FORNO', price: 5.00 },
        ]
      }
    ]
  },
  {
    id: 'sobremesas',
    name: 'SOBREMESAS',
    items: [
      { id: 'copo-felicidade', name: 'COPO DA FELICIDADE', price: 16.00 },
      { id: 'bolo-chocolate', name: 'BOLO DE CHOCOLATE', description: 'recheios de ninho e brigadeiro', price: 10.00 },
      { id: 'bolo-cenoura', name: 'BOLO DE CENOURA', description: 'com cobertura de chocolate', price: 6.00 },
      { id: 'banoffe', name: 'BANOFFE', price: 6.00 },
      { id: 'brownie-recheado', name: 'BROWNIE RECHEADO', description: 'ninho, brigadeiro, doce de leite', price: 8.00 },
    ]
  },
  {
    id: 'potes-felicidade',
    name: 'POTES DA FELICIDADE',
    items: [
      { id: 'pote-choc-maracuja', name: 'CHOCOLATE COM MARACUJÁ', price: 15.00 },
      { id: 'pote-maracuja-ninho', name: 'MARACUJÁ COM NINHO', price: 15.00 },
      { id: 'pote-nutella-maracuja', name: 'NUTELLA COM MARACUJÁ', price: 15.00 },
      { id: 'pote-ninho-nutella', name: 'NINHO COM NUTELLA', price: 15.00 },
    ]
  },
  {
    id: 'bebidas',
    name: 'BEBIDAS',
    items: [
      { id: 'guaravita', name: 'GUARAVITA', price: 2.00 },
      { id: 'guaraviton', name: 'GUARAVITON', price: 5.00 },
      { id: 'coca-lata', name: 'COCA LATA 320ml', price: 6.00 },
      { id: 'fanta-lata', name: 'FANTA LATA 320ml', price: 6.00 },
      { id: 'guarana-lata', name: 'GUARANÁ ANTARCTICA LATA 320ml', price: 6.00 },
      { id: 'del-vale-lata', name: 'DEL VALE LATA 320ml', price: 6.00 },
      { id: 'h2o', name: 'H2O', price: 7.00 },
      { id: 'coca-2l', name: 'COCA 2L.', price: 14.00 },
      { id: 'guarana-2l', name: 'GUARANÁ ANTARCTICA 2L.', price: 12.00 },
      { id: 'fanta-2l', name: 'FANTA UVA / LARANJA 2L.', price: 12.00 },
      { id: 'sprite-2l', name: 'SPRITE 2L.', price: 12.00 },
      { id: 'coca-retornavel', name: 'COCA RETORNÁVEL', price: 9.00 },
      { id: 'morango-leite', name: 'MORANGO AO LEITE 300ml', price: 9.00 },
      { id: 'suco-natural', name: 'SUCO NATURAL 300ml', price: 7.00 },
    ]
  }
];
