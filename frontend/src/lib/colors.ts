const SWATCHES: Record<string, string> = {
  Blanc: "#f5f5f2",
  Noir: "#151515",
  Sable: "#d8c7a8",
  Beige: "#d9c7a7",
  Écru: "#efe8d8",
  Camel: "#b08350",
  Marron: "#6b4228",
  Terracotta: "#c2683f",
  Rouge: "#b3261e",
  Bordeaux: "#6d1f2c",
  "Rose poudré": "#e7c4c0",
  Kaki: "#6b6b3a",
  Olive: "#6b7046",
  "Vert sauge": "#9caf88",
  "Bleu clair": "#a9c1d9",
  "Bleu marine": "#1f2a44",
  Indigo: "#2c3a63",
  "Gris chiné": "#9a9a9a",
  "Gris anthracite": "#3f4245",
};

export const swatch = (color: string) => SWATCHES[color] ?? "#cccccc";
