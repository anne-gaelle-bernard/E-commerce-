import { PrismaClient, type Gender } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const unsplash = (photo: string, crop = "center") =>
  `https://images.unsplash.com/photo-${photo}?w=800&h=1067&fit=crop&crop=${crop}&q=80&auto=format`;

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL"];
const SHOE_SIZES = ["38", "39", "40", "41", "42", "43", "44"];

interface SeedProduct {
  name: string;
  description: string;
  price: number; // en euros
  gender: Gender;
  category: string;
  colors: string[];
  photo: string; // id Unsplash
  crop?: string;
  sizes: string[];
}

const PRODUCTS: SeedProduct[] = [
  { name: "T-shirt Essentiel en coton bio", photo: "1787435917441-b81ea7c49390", description: "T-shirt col rond en jersey de coton biologique, coupe droite et toucher doux. Une base indispensable du vestiaire.", price: 25, gender: "UNISEXE", category: "T-shirts", colors: ["Blanc", "Noir", "Sable"], sizes: CLOTHING_SIZES },
  { name: "T-shirt rayé marinière", photo: "1564430362299-113976f94001", description: "Marinière à rayures en coton épais, col bateau. Fabriquée au Portugal.", price: 39, gender: "FEMME", category: "T-shirts", colors: ["Bleu marine", "Rouge"], sizes: CLOTHING_SIZES },
  { name: "T-shirt poche Heavy", photo: "1622519407650-3df9883f76a5", description: "T-shirt en coton lourd 220 g/m² avec poche poitrine, coupe légèrement oversize.", price: 32, gender: "HOMME", category: "T-shirts", colors: ["Kaki", "Gris chiné", "Noir"], sizes: CLOTHING_SIZES },
  { name: "Pull col rond en laine mérinos", photo: "1614495039268-aa9a80429b66", description: "Pull fin en laine mérinos extra-fine, thermorégulant et respirant. Se porte seul ou en superposition.", price: 79, gender: "HOMME", category: "Pulls", colors: ["Gris anthracite", "Bleu marine", "Camel"], sizes: CLOTHING_SIZES },
  { name: "Cardigan maille torsadée", photo: "1568125789396-c17c53160be5", description: "Cardigan boutonné en maille torsadée, mélange laine et alpaga pour une chaleur sans poids.", price: 95, gender: "FEMME", category: "Pulls", colors: ["Écru", "Vert sauge"], sizes: CLOTHING_SIZES },
  { name: "Sweat à capuche molleton", photo: "1779676086744-a83b1f0e00bd", description: "Sweat à capuche en molleton gratté, poche kangourou et cordons plats.", price: 65, gender: "UNISEXE", category: "Pulls", colors: ["Rose poudré", "Gris chiné", "Noir"], sizes: CLOTHING_SIZES },
  { name: "Jean droit brut", photo: "1626876880576-9990b14f0534", description: "Jean coupe droite en denim brut 13,5 oz, se patine avec le temps. Cinq poches, braguette à boutons.", price: 89, gender: "HOMME", category: "Pantalons", colors: ["Indigo"], sizes: ["38", "40", "42", "44"] },
  { name: "Pantalon large en lin", photo: "1789110853687-71692f0e86be", description: "Pantalon fluide à jambes larges en lin lavé, taille élastiquée et poches côtés.", price: 69, gender: "FEMME", category: "Pantalons", colors: ["Sable", "Noir", "Terracotta"], sizes: CLOTHING_SIZES },
  { name: "Chino slim stretch", photo: "1787435906030-f52e34c2b440", description: "Chino en twill de coton stretch, coupe slim confortable pour toute la journée.", price: 59, gender: "HOMME", category: "Pantalons", colors: ["Beige", "Bleu marine", "Olive"], sizes: ["38", "40", "42", "44"] },
  { name: "Veste en jean oversize", photo: "1577660002965-04865592fc60", description: "Veste en denim délavé, coupe ample, boutons métalliques et poches poitrine.", price: 99, gender: "FEMME", category: "Vestes", colors: ["Bleu clair"], sizes: CLOTHING_SIZES },
  { name: "Trench imperméable", photo: "1633821879282-0c4e91f96232", description: "Trench mi-long en gabardine de coton déperlant, ceinture à nouer et double boutonnage.", price: 189, gender: "FEMME", category: "Vestes", colors: ["Beige", "Noir"], sizes: CLOTHING_SIZES },
  { name: "Surchemise en laine", photo: "1619603364937-8d7af41ef206", description: "Surchemise chaude en drap de laine, deux poches plaquées, idéale en mi-saison.", price: 119, gender: "HOMME", category: "Vestes", colors: ["Gris anthracite", "Camel"], sizes: CLOTHING_SIZES },
  { name: "Baskets cuir minimalistes", photo: "1608384177866-0bca0d225435", crop: "bottom", description: "Baskets basses en cuir pleine fleur, semelle en caoutchouc cousue. Design épuré.", price: 129, gender: "UNISEXE", category: "Chaussures", colors: ["Blanc", "Noir"], sizes: SHOE_SIZES },
  { name: "Bottines Chelsea", photo: "1577387224391-5de31164a0e0", description: "Bottines Chelsea en daim, élastiques latéraux et semelle crantée antidérapante.", price: 149, gender: "UNISEXE", category: "Chaussures", colors: ["Marron", "Noir"], sizes: SHOE_SIZES },
  { name: "Bonnet côtelé", photo: "1548612621-77df2f2c5246", description: "Bonnet en maille côtelée laine et cachemire, revers large.", price: 29, gender: "UNISEXE", category: "Accessoires", colors: ["Noir", "Camel", "Bordeaux"], sizes: ["TU"] },
  { name: "Écharpe en laine", photo: "1787045098569-2e17ae871df4", description: "Grande écharpe tissée en laine d'agneau, finitions franges.", price: 45, gender: "UNISEXE", category: "Accessoires", colors: ["Gris anthracite", "Camel"], sizes: ["TU"] },
  { name: "Sac cabas en toile", photo: "1544816155-12df9643f363", description: "Cabas en toile de coton épaisse avec anses en cuir, poche intérieure zippée.", price: 55, gender: "FEMME", category: "Accessoires", colors: ["Écru", "Noir"], sizes: ["TU"] },
];

function stockFor(index: number) {
  const values = [12, 5, 0, 8, 2, 15, 7, 1, 10, 4];
  return values[index % values.length];
}

async function main() {
  console.log("Réinitialisation des données…");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      { email: "admin@maisonlune.fr", passwordHash: await bcrypt.hash("Admin12345!", 12), firstName: "Alice", lastName: "Admin", role: "ADMIN" },
      { email: "client@maisonlune.fr", passwordHash: await bcrypt.hash("Client12345!", 12), firstName: "Camille", lastName: "Martin", role: "CUSTOMER" },
    ],
  });

  const categoryNames = [...new Set(PRODUCTS.map((p) => p.category))];
  const categories = new Map<string, number>();
  for (const name of categoryNames) {
    const category = await prisma.category.create({ data: { name, slug: slugify(name) } });
    categories.set(name, category.id);
  }

  let variantIndex = 0;
  for (const [i, p] of PRODUCTS.entries()) {
    const slug = slugify(p.name);
    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: p.description,
        priceCents: p.price * 100,
        imageUrl: unsplash(p.photo, p.crop),
        gender: p.gender,
        categoryId: categories.get(p.category)!,
        createdAt: new Date(Date.now() - i * 86_400_000),
        variants: {
          create: p.colors.flatMap((color) =>
            p.sizes.map((size) => ({ color, size, stock: stockFor(variantIndex++) })),
          ),
        },
      },
    });
  }

  console.log(`✔ ${categoryNames.length} catégories, ${PRODUCTS.length} produits, 2 utilisateurs créés`);
  console.log("  Admin  : admin@maisonlune.fr / Admin12345!");
  console.log("  Client : client@maisonlune.fr / Client12345!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
