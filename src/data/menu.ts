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
  is_active?: boolean;
  category_id?: string;
  subcategory_id?: string;
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
    "id": "cb9d163b-5572-49ee-aeff-119fef22ad67",
    "name": "ARTESANAIS",
    "items": [
      {
        "id": "f53273e9-ea12-4bbf-897a-4958d06e2bf5",
        "name": "VALENTE DE GLÓRIA",
        "description": "blend 180g, costela desfiada, cream cheese, queijo, molho especial, pão de brioche",
        "price": 26,
        "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777260485054.jpeg",
        "addons": artesanalAddons
      },
      {
        "id": "eafcd7a9-bfcf-4ccb-8dc9-6ab295efbc76",
        "name": "O CONQUISTADOR",
        "description": "blend 180g, bacon, ovo, queijo, molho especial, pão brioche",
        "price": 23,
        "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777260496119.jpeg",
        "addons": artesanalAddons
      },
      {
        "id": "240069f9-a62a-4972-a537-d9c3e212f2f2",
        "name": "GOLPE DE GLÓRIA",
        "description": "blend 180g, onion rings, bacon, queijo, molho especial, pão de brioche",
        "price": 25,
        "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777260639098.jpeg",
        "addons": artesanalAddons
      },
      {
        "id": "58c425fc-93bf-4113-8cd2-85bb7fdc0c51",
        "name": "O ESCOLHIDO",
        "description": "blend 180g, creme de cheddar especial, fatiado de cheddar, molho especial, pão de brioche",
        "price": 21,
        "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777260704992.jpeg",
        "addons": artesanalAddons
      },
      {
        "id": "b34c16bc-d3fb-4082-93cc-5466ac3164bc",
        "name": "GLÓRIA SUPREMA",
        "description": "blend 180g, queijo empanado, bacon, molho especial, pão de brioche",
        "price": 28,
        "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777260693098.jpeg",
        "addons": artesanalAddons
      }
    ]
  },
  {
    "id": "346cd908-369a-4888-a462-8f55c725e60d",
    "name": "BATATAS",
    "items": [
      {
        "id": "ab7f28eb-44c7-499e-9d40-24fdac095dca",
        "name": "CHEDDAR + BACON",
        "price": 20,
        "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777323054508.jpg"
      },
      {
        "id": "b3285e5a-0f50-4d8a-90c1-c9acaceefd91",
        "name": "MUSSARELA + CALABRESA",
        "price": 20,
        "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777323113771.webp"
      },
      {
        "id": "bc941610-f28a-4fc2-86bb-dcdbe8d5d50e",
        "name": "COSTELA + CREAM CHEESE",
        "price": 22,
        "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777323096164.jpg"
      },
      {
        "id": "62175faa-41c7-432a-bb57-0ff85be035eb",
        "name": "PEQUENA",
        "price": 8,
        "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777323140019.jpg"
      }
    ]
  },
  {
    "id": "f9fe53ff-27d8-4100-8ddb-78123660ec75",
    "name": "SALGADOS",
    "subcategories": [
      {
        "name": "FRITOS",
        "items": [
          {
            "id": "886a3e35-e242-4201-8580-c26597d1aad2",
            "name": "COXINHA",
            "price": 1.5,
            "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777323398405.webp"
          },
          {
            "id": "33429e49-6e57-4ba6-b445-fa80cfb4ece4",
            "name": "RISOLE DE CAMARÃO",
            "price": 2,
            "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777324247509.jpg"
          },
          {
            "id": "ddc12bd9-d0ec-459d-a045-72809127beef",
            "name": "QUIBE",
            "price": 1.5,
            "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777324262141.jpg"
          },
          {
            "id": "2b140f2d-87fd-4592-932a-5c2102c8c11d",
            "name": "BOLINHO DE AIPIM",
            "price": 2.5,
            "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777324287499.jpg"
          },
          {
            "id": "84f2d8f3-15ea-4b97-ab68-7da7e44fbc6c",
            "name": "ENROLADINHO DE SALSICHA",
            "price": 1.5,
            "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777324556097.jpg"
          },
          {
            "id": "8d69e85a-ff18-413e-b768-913c57af6bfd",
            "name": "QUEIJO COM PRESUNTO",
            "price": 1.5,
            "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777324592748.jpg"
          },
          {
            "id": "6c991147-fda5-4a45-ab8c-c1ad0599bc40",
            "name": "QUEIJO COM ALHO",
            "price": 1.5
          },
          {
            "id": "8b18516a-8ff8-48a1-a032-79b0483f9d11",
            "name": "BOLINHA DE QUEIJO",
            "price": 1.5,
            "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777324608497.webp"
          }
        ]
      },
      {
        "name": "MINI ASSADOS",
        "items": [
          {
            "id": "23c930ab-0371-4bde-a92a-80a5c13eac49",
            "name": "JOELHO DE QUEIJO COM PRESUNTO",
            "price": 1
          },
          {
            "id": "f3a6f95e-babf-4153-9c04-f16c0a4e541d",
            "name": "JOELHO DE FRANGO COM REQUEIJÃO",
            "price": 1
          },
          {
            "id": "f86073ee-4c7e-4c61-8337-c939c01b3e1f",
            "name": "EMPADINHA",
            "price": 1
          }
        ]
      },
      {
        "name": "ASSADOS GRANDES",
        "items": [
          {
            "id": "c276f48b-2a9d-48ea-91bd-e423c590461c",
            "name": "JOELHO DE QUEIJO COM PRESUNTO",
            "price": 5
          },
          {
            "id": "a094011c-458d-47ae-a9d4-3fe83d81944d",
            "name": "JOELHO DE FRANGO COM REQUEIJÃO",
            "price": 5
          },
          {
            "id": "28a1aae7-35e1-4315-b761-b57cba0ef178",
            "name": "HAMBURGUER DE FORNO",
            "price": 5
          }
        ]
      }
    ]
  },
  {
    "id": "21303731-5d65-4250-b0fe-fdb78a163b37",
    "name": "PIZZAS",
    "items": [
      {
        "id": "d9bd4416-3628-422d-95f7-49b8c708cd9d",
        "name": "MUSSARELA",
        "description": "ESCOLHA ATÉ 2 SABORES",
        "variants": [
          {
            "name": "25CM",
            "price": 25
          },
          {
            "name": "30CM",
            "price": 32
          },
          {
            "name": "35CM",
            "price": 41
          }
        ]
      },
      {
        "id": "23e7db20-81e0-41d6-83ca-076623ac03b8",
        "name": "CALABRESA",
        "description": "ESCOLHA ATÉ 2 SABORES",
        "variants": [
          {
            "name": "25CM",
            "price": 25
          },
          {
            "name": "30CM",
            "price": 32
          },
          {
            "name": "35CM",
            "price": 41
          }
        ]
      },
      {
        "id": "849dc94f-5b44-47b6-bf12-24acc432a045",
        "name": "PRESUNTO",
        "description": "ESCOLHA ATÉ 2 SABORES",
        "variants": [
          {
            "name": "25CM",
            "price": 25
          },
          {
            "name": "30CM",
            "price": 32
          },
          {
            "name": "35CM",
            "price": 41
          }
        ]
      },
      {
        "id": "070b9947-96da-40d6-8bb5-5f496e73bbbd",
        "name": "FRANGO COM CATUPIRY",
        "description": "ESCOLHA ATÉ 2 SABORES",
        "variants": [
          {
            "name": "25CM",
            "price": 26
          },
          {
            "name": "30CM",
            "price": 34
          },
          {
            "name": "35CM",
            "price": 41
          }
        ]
      },
      {
        "id": "057b639f-67b4-4e8c-920c-5fdd939197b9",
        "name": "BACON",
        "description": "ESCOLHA ATÉ 2 SABORES",
        "variants": [
          {
            "name": "25CM",
            "price": 28
          },
          {
            "name": "30CM",
            "price": 38
          },
          {
            "name": "35CM",
            "price": 45
          }
        ]
      },
      {
        "id": "7ea45a6a-25cb-43f0-9fa2-c0f8f685c717",
        "name": "BACON COM OVOS",
        "description": "ESCOLHA ATÉ 2 SABORES",
        "variants": [
          {
            "name": "25CM",
            "price": 28
          },
          {
            "name": "30CM",
            "price": 38
          },
          {
            "name": "35CM",
            "price": 45
          }
        ]
      },
      {
        "id": "4116abaf-07e6-4d78-b582-97e5396a95fc",
        "name": "QUEIJO MINAS + BACON",
        "description": "ESCOLHA ATÉ 2 SABORES",
        "variants": [
          {
            "name": "25CM",
            "price": 28
          },
          {
            "name": "30CM",
            "price": 38
          },
          {
            "name": "35CM",
            "price": 45
          }
        ]
      },
      {
        "id": "4d89388b-7a7e-4a94-9a77-d864573df38c",
        "name": "CARNE SECA",
        "description": "ESCOLHA ATÉ 2 SABORES",
        "variants": [
          {
            "name": "25CM",
            "price": 30
          },
          {
            "name": "30CM",
            "price": 40
          },
          {
            "name": "35CM",
            "price": 50
          }
        ]
      },
      {
        "id": "ec5490e9-5960-4a0a-8ac1-bab6c5fd6a8d",
        "name": "CAMARÃO",
        "description": "ESCOLHA ATÉ 2 SABORES",
        "variants": [
          {
            "name": "25CM",
            "price": 30
          },
          {
            "name": "30CM",
            "price": 40
          },
          {
            "name": "35CM",
            "price": 50
          }
        ]
      },
      {
        "id": "cee4dcee-fd28-453c-9dd6-cea0e52fe025",
        "name": "PORTUGUESA",
        "description": "ESCOLHA ATÉ 2 SABORES",
        "variants": [
          {
            "name": "25CM",
            "price": 30
          },
          {
            "name": "30CM",
            "price": 40
          },
          {
            "name": "35CM",
            "price": 50
          }
        ]
      }
    ]
  },
  {
    "id": "446b7171-67dd-48d5-9e81-965c48a9dff4",
    "name": "MASSAS",
    "subcategories": [
      {
        "name": "PANQUECAS",
        "items": [
          {
            "id": "1ecab1b7-0ce4-43d9-9f95-37e7d07119c8",
            "name": "CAMARÃO",
            "variants": [
              {
                "name": "PEQUENA",
                "price": 10
              },
              {
                "name": "MÉDIA",
                "price": 25
              },
              {
                "name": "GRANDE",
                "price": 45
              }
            ]
          },
          {
            "id": "7a3ac079-97cf-4fe9-815e-cd9bc05fe600",
            "name": "CARNE",
            "variants": [
              {
                "name": "PEQUENA",
                "price": 10
              },
              {
                "name": "MÉDIA",
                "price": 25
              },
              {
                "name": "GRANDE",
                "price": 45
              }
            ]
          },
          {
            "id": "b196a6d0-422f-44b9-a77d-af54719fab57",
            "name": "FRANGO",
            "variants": [
              {
                "name": "PEQUENA",
                "price": 10
              },
              {
                "name": "MÉDIA",
                "price": 25
              },
              {
                "name": "GRANDE",
                "price": 45
              }
            ]
          }
        ]
      },
      {
        "name": "NHOQUE",
        "items": [
          {
            "id": "af6b62b5-8e9c-43b7-87d2-2f9b62678ad0",
            "name": "CAMARÃO",
            "variants": [
              {
                "name": "PEQUENA",
                "price": 10
              },
              {
                "name": "MÉDIA",
                "price": 25
              },
              {
                "name": "GRANDE",
                "price": 45
              }
            ]
          },
          {
            "id": "1c13d0b3-1349-4be7-a007-85cd8a4067fe",
            "name": "CARNE",
            "variants": [
              {
                "name": "PEQUENA",
                "price": 10
              },
              {
                "name": "MÉDIA",
                "price": 25
              },
              {
                "name": "GRANDE",
                "price": 45
              }
            ]
          },
          {
            "id": "13002342-4e0f-4e28-aeed-e00017b58ad8",
            "name": "FRANGO",
            "variants": [
              {
                "name": "PEQUENA",
                "price": 10
              },
              {
                "name": "MÉDIA",
                "price": 25
              },
              {
                "name": "GRANDE",
                "price": 45
              }
            ]
          },
          {
            "id": "4c6cf2ee-2ef2-4e0e-9871-da166dfdb54b",
            "name": "CARNE SECA",
            "variants": [
              {
                "name": "PEQUENA",
                "price": 10
              },
              {
                "name": "MÉDIA",
                "price": 25
              },
              {
                "name": "GRANDE",
                "price": 45
              }
            ]
          }
        ]
      },
      {
        "name": "ESCONDIDINHO",
        "items": [
          {
            "id": "701bfcc8-eb53-493d-8e72-d2bc5f11c033",
            "name": "CAMARÃO",
            "variants": [
              {
                "name": "PEQUENA",
                "price": 10
              },
              {
                "name": "MÉDIA",
                "price": 25
              },
              {
                "name": "GRANDE",
                "price": 45
              }
            ]
          },
          {
            "id": "4fadd878-b609-4142-87e0-29750b7f9fac",
            "name": "CARNE",
            "variants": [
              {
                "name": "PEQUENA",
                "price": 10
              },
              {
                "name": "MÉDIA",
                "price": 25
              },
              {
                "name": "GRANDE",
                "price": 45
              }
            ]
          },
          {
            "id": "d1253126-934c-41dd-a2c7-e9f9e4e6755b",
            "name": "FRANGO",
            "variants": [
              {
                "name": "PEQUENA",
                "price": 10
              },
              {
                "name": "MÉDIA",
                "price": 25
              },
              {
                "name": "GRANDE",
                "price": 45
              }
            ]
          },
          {
            "id": "6da62732-5b1b-4319-a174-2972c034b1bc",
            "name": "CARNE SECA",
            "variants": [
              {
                "name": "PEQUENA",
                "price": 10
              },
              {
                "name": "MÉDIA",
                "price": 25
              },
              {
                "name": "GRANDE",
                "price": 45
              }
            ]
          }
        ]
      },
      {
        "name": "LASANHA",
        "items": [
          {
            "id": "25b2017b-2e97-4d4a-a997-daa821429d27",
            "name": "CAMARÃO",
            "variants": [
              {
                "name": "PEQUENA",
                "price": 10
              },
              {
                "name": "MÉDIA",
                "price": 25
              },
              {
                "name": "GRANDE",
                "price": 45
              }
            ]
          },
          {
            "id": "98268ad6-66a4-4c2f-98ad-ddeff1fade1b",
            "name": "CARNE",
            "variants": [
              {
                "name": "PEQUENA",
                "price": 10
              },
              {
                "name": "MÉDIA",
                "price": 25
              },
              {
                "name": "GRANDE",
                "price": 45
              }
            ]
          },
          {
            "id": "8395cf3c-0a66-4b4b-ae88-1cacd6fdbff3",
            "name": "FRANGO",
            "variants": [
              {
                "name": "PEQUENA",
                "price": 10
              },
              {
                "name": "MÉDIA",
                "price": 25
              },
              {
                "name": "GRANDE",
                "price": 45
              }
            ]
          },
          {
            "id": "21ac7545-b570-4104-96ca-76c509132e4d",
            "name": "QUEIJO COM PRESUNTO",
            "variants": [
              {
                "name": "PEQUENA",
                "price": 10
              },
              {
                "name": "MÉDIA",
                "price": 25
              },
              {
                "name": "GRANDE",
                "price": 45
              }
            ]
          },
          {
            "id": "d5f7d618-3f91-4b34-9452-9c2cb31a2b53",
            "name": "CARNE SECA",
            "variants": [
              {
                "name": "PEQUENA",
                "price": 10
              },
              {
                "name": "MÉDIA",
                "price": 25
              },
              {
                "name": "GRANDE",
                "price": 45
              }
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "675f8182-3d3b-43bc-966b-64242e15acac",
    "name": "HAMBURGUER",
    "items": [
      {
        "id": "1c037b9e-fc78-4f96-9124-fb0beb89664e",
        "name": "X-BURGUER",
        "description": "pão, carne, queijo, salada, molho especial e batata filetada",
        "price": 7.5,
        "addons": traditionalAddons
      },
      {
        "id": "82e78a00-df69-44ba-9fac-d466051bac96",
        "name": "X-EGG",
        "description": "pão, carne, queijo, presunto, ovo, salada, molho especial e batata filetada",
        "price": 11,
        "addons": traditionalAddons
      },
      {
        "id": "d5dae636-3a6f-426c-9ad4-d881a7274dfe",
        "name": "X-BACON",
        "description": "pão, carne, queijo, presunto, bacon, salada, molho especial e batata filetada",
        "price": 11,
        "addons": traditionalAddons
      },
      {
        "id": "0b337606-89f3-4bbb-b8d2-05ccac35164c",
        "name": "X-TUDO",
        "description": "pão, carne, queijo, presunto, ovo, bacon, salada, molho especial e batata filetada",
        "price": 13,
        "addons": traditionalAddons
      },
      {
        "id": "07880a26-0fdb-496c-9436-d30216439a75",
        "name": "CHEDDAR BACON",
        "description": "pão, carne, queijo cheddar, salada, molho especial e batata filetada",
        "price": 10,
        "addons": traditionalAddons
      },
      {
        "id": "774b3d92-1533-43fd-b06e-c3c1803978a0",
        "name": "X-TUDO DUPLO",
        "description": "pão, 2 carnes, 2 queijos, 2 presuntos, ovo, bacon, salada, molho especial e batata filetada",
        "price": 15,
        "addons": traditionalAddons
      },
      {
        "id": "ebfa3583-340d-4641-a963-a6fe8e451e52",
        "name": "DUPLO CHEDDAR BACON",
        "description": "pão, 2 carnes, 2 queijos cheddar, salada, molho especial e batata filetada",
        "price": 15,
        "addons": traditionalAddons
      },
      {
        "id": "9ae39690-f30e-4387-baf9-003740c34f8a",
        "name": "X-TUDO PICANHA",
        "description": "pão, carne, queijo, presunto, ovo, bacon, salada, molho especial e batata filetada",
        "price": 15,
        "addons": traditionalAddons
      }
    ]
  },
  {
    "id": "65e78d2f-a374-4293-bd9c-098918f98057",
    "name": "BEBIDAS",
    "items": [
      {
        "id": "97064252-b6ab-4487-81cb-d3a2f81ce498",
        "name": "GUARAVITA",
        "price": 2
      },
      {
        "id": "a8ce63db-4f4b-4d1a-bce9-da0472423cf5",
        "name": "GUARAVITON",
        "price": 5
      },
      {
        "id": "e065967b-4a6e-4857-b5b9-94d734021da3",
        "name": "COCA LATA 320ml",
        "price": 6
      },
      {
        "id": "fac7a9e1-cf3b-442a-a253-82f8a322d985",
        "name": "FANTA LATA 320ml",
        "price": 6
      },
      {
        "id": "4d95dfb4-f531-4776-8c1d-1aac614a6663",
        "name": "GUARANÁ ANTARCTICA LATA 320ml",
        "price": 6
      },
      {
        "id": "c3b171e7-6a27-4032-bdde-38a64df149c8",
        "name": "DEL VALE LATA 320ml",
        "price": 6
      },
      {
        "id": "31c67695-5c00-49f2-99b2-021f1b144d41",
        "name": "H2O",
        "price": 7
      },
      {
        "id": "209bc4a6-b607-48d8-915e-bcd0eec7db3d",
        "name": "COCA 2L.",
        "price": 14
      },
      {
        "id": "614647f6-70a4-4eb3-a41a-50dc4151d366",
        "name": "GUARANÁ ANTARCTICA 2L.",
        "price": 12
      },
      {
        "id": "bc4bfa3c-e81a-4458-8dc9-1f8736faf657",
        "name": "FANTA UVA / LARANJA 2L.",
        "price": 12
      },
      {
        "id": "5fbff8a6-441e-4072-acc2-ba27d872b8cb",
        "name": "SPRITE 2L.",
        "price": 12
      },
      {
        "id": "83c02364-6b38-48c1-b19e-9bcf5c1160a9",
        "name": "COCA RETORNÁVEL",
        "price": 9
      },
      {
        "id": "7e328105-e514-4688-9d63-6a39d293689e",
        "name": "MORANGO AO LEITE 300ml",
        "price": 9
      },
      {
        "id": "b372c6f8-e9f6-457a-9a74-03c0cddd9d04",
        "name": "SUCO NATURAL 300ml",
        "price": 7
      }
    ]
  },
  {
    "id": "203fc147-84c0-4a5a-ad29-f47a85afd6a9",
    "name": "SOBREMESAS",
    "items": [
      {
        "id": "c0ff2b71-0a07-43ed-930a-0ed69bf271e2",
        "name": "COPO DA FELICIDADE",
        "description": "com recheio e frutas",
        "price": 16,
        "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777259631400.jpeg"
      },
      {
        "id": "3ecfd2ee-599a-42f3-b0b5-e0cebb92bbb9",
        "name": "BOLO DE CHOCOLATE",
        "price": 10,
        "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777260054480.webp"
      },
      {
        "id": "9abe8eae-7bd3-40d9-b578-c63e058569f8",
        "name": "BOLO DE CENOURA",
        "description": "com cobertura de chocolate",
        "price": 6,
        "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777260126172.webp"
      },
      {
        "id": "a6c84dc5-0af3-4e8f-83d5-c70a40aadbf0",
        "name": "BANOFFE",
        "price": 6,
        "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777260180431.jpg"
      },
      {
        "id": "c8eaecf7-492a-4348-9b5c-ed5bd448728a",
        "name": "BROWNIE RECHEADO",
        "price": 8,
        "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777260258377.jpg"
      }
    ]
  },
  {
    "id": "42b19651-126e-4deb-9b83-b818580005d7",
    "name": "POTES DA FELICIDADE",
    "items": [
      {
        "id": "242431d5-3a33-442c-81c6-c01205b8faeb",
        "name": "CHOCOLATE COM MARACUJÁ",
        "price": 15,
        "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777260381167.jpg"
      },
      {
        "id": "3286b8c4-5292-4754-8f1b-a14c3c361574",
        "name": "MARACUJÁ COM NINHO",
        "price": 15,
        "imageUrl": "https://oclnccsublpamptcdojf.supabase.co/storage/v1/object/public/products/products/1777260440052.jpg"
      },
      {
        "id": "8aeea681-0ea3-4361-9c31-5e285146d882",
        "name": "NUTELLA COM MARACUJÁ",
        "price": 15
      },
      {
        "id": "529c0861-8063-4eee-84dd-492846d3b722",
        "name": "NINHO COM NUTELLA",
        "price": 15
      }
    ]
  }
];
