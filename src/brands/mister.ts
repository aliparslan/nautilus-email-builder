export type BrandAsset = {
  id: string;
  name: string;
  alt: string;
  /** Local, optimized image used by the editor catalog. */
  thumbnail: string;
  /** Public source inserted into emails so it works outside this app. */
  src: string;
};

export const MISTER_ASSETS: BrandAsset[] = [
  {
    id: "mister-logo-color",
    name: "Mister logo",
    alt: "Mister Car Wash",
    thumbnail: "/brands/mister/logo-color.png",
    src: "https://cdn.bfldr.com/PENMAIHR/at/7n74b4hw42nr59f6wk46xkj/Mister_Logo-23-BlueYellow-RGB.png?format=png&width=450&height=153",
  },
  {
    id: "mister-logo-white",
    name: "Mister logo · white",
    alt: "Mister Car Wash",
    thumbnail: "/brands/mister/logo-white.png",
    src: "https://cdn.bfldr.com/PENMAIHR/at/87w6jsp4hbhcgp38nvx82mrh/Mister_Logo-23-WhiteYellow-RGB.png?format=png&width=450&height=153",
  },
  {
    id: "mister-tunnel",
    name: "Titanium tunnel",
    alt: "A vehicle moving through a Mister Car Wash tunnel",
    thumbnail: "/brands/mister/tunnel.webp",
    src: "https://cdn.bfldr.com/PENMAIHR/at/vrf497457z6r865qv84pg4s/AZ1322_Thornydale-Titan_Tunnel_1.jpg?auto=webp&width=1200&height=800&format=webp",
  },
  {
    id: "mister-signature-products",
    name: "Signature products",
    alt: "Mister Car Wash signature wash products",
    thumbnail: "/brands/mister/signature-products.webp",
    src: "https://cdn.bfldr.com/PENMAIHR/at/f374xg4hp5n7xx55k45j937/SignatureProducts-700x613.png?auto=webp",
  },
  {
    id: "mister-titanium",
    name: "Titanium 360°",
    alt: "Titanium 360 degree wash treatment",
    thumbnail: "/brands/mister/titanium-360.webp",
    src: "https://cdn.bfldr.com/PENMAIHR/at/mv49mm28gqppgqnpbs95qqwh/Titanium360-700x613.png?auto=webp",
  },
  {
    id: "mister-hotshine",
    name: "HotShine®",
    alt: "HotShine Carnauba Wax treatment",
    thumbnail: "/brands/mister/hotshine.webp",
    src: "https://cdn.bfldr.com/PENMAIHR/at/nmn6jq8c5mrv83rb36whxg9/HotShine-700x613.png?auto=webp",
  },
  {
    id: "mister-repel-shield",
    name: "Repel Shield",
    alt: "Platinum Repel Shield treatment",
    thumbnail: "/brands/mister/repel-shield.webp",
    src: "https://cdn.bfldr.com/PENMAIHR/at/769g6tn8kzhrptktr4hkv486/PlatinumRepelShield-700x613.png?auto=webp",
  },
  {
    id: "mister-wheel-polish",
    name: "Wheel Polish",
    alt: "Mister Wheel Polish treatment",
    thumbnail: "/brands/mister/wheel-polish.webp",
    src: "https://cdn.bfldr.com/PENMAIHR/at/64c5sgj3cxqs68f34gg7rprw/WheelPolish-700x613.png?auto=webp",
  },
];

export const misterAsset = (id: string) =>
  MISTER_ASSETS.find((asset) => asset.id === id)!;
