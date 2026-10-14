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

const CLOTHING = ["XS", "S", "M", "L", "XL"];
const TROUSERS = ["38", "40", "42", "44"];
const SHOES = ["38", "39", "40", "41", "42", "43", "44"];
const ONE_SIZE = ["TU"];

const CATEGORIES: { name: string; photo: string }[] = [
  { name: "T-shirts", photo: "1564430362299-113976f94001" },
  { name: "Chemises", photo: "1624835567150-0c530a20d8cc" },
  { name: "Pulls", photo: "1568125789396-c17c53160be5" },
  { name: "Robes & jupes", photo: "1789110520302-3df8ce0410f0" },
  { name: "Pantalons", photo: "1787435906030-f52e34c2b440" },
  { name: "Vestes", photo: "1633821879282-0c4e91f96232" },
  { name: "Chaussures", photo: "1577387224391-5de31164a0e0" },
  { name: "Accessoires", photo: "1548612621-77df2f2c5246" },
];

interface SeedColor {
  name: string;
  photo: string; // id Unsplash
  crop?: string;
}

interface SeedProduct {
  name: string;
  description: string;
  price: number; // en euros
  gender: Gender;
  category: string;
  sizes: string[];
  colors: SeedColor[];
}

const PRODUCTS: SeedProduct[] = [
  // T-shirts
  { name: "T-shirt Essentiel en coton bio", description: "T-shirt col rond en jersey de coton biologique, coupe droite et toucher doux. Une base indispensable du vestiaire.", price: 25, gender: "UNISEXE", category: "T-shirts", sizes: CLOTHING,
    colors: [{ name: "Blanc", photo: "1787435917441-b81ea7c49390" }, { name: "Noir", photo: "1571455786673-9d9d6c194f90" }] },
  { name: "T-shirt rayé marinière", description: "Marinière à rayures en coton épais, col bateau. Fabriquée au Portugal.", price: 39, gender: "FEMME", category: "T-shirts", sizes: CLOTHING,
    colors: [{ name: "Rayé noir", photo: "1564430362299-113976f94001" }] },
  { name: "T-shirt poche Heavy", description: "T-shirt en coton lourd 220 g/m² avec poche poitrine, coupe légèrement oversize.", price: 32, gender: "HOMME", category: "T-shirts", sizes: CLOTHING,
    colors: [{ name: "Noir", photo: "1622519407650-3df9883f76a5" }] },
  { name: "Polo en maille", description: "Polo en maille de coton à col ouvert, manches courtes. Élégant sans être habillé.", price: 59, gender: "HOMME", category: "T-shirts", sizes: CLOTHING,
    colors: [{ name: "Camel", photo: "1761956255479-484d7d4fe68a" }, { name: "Chocolat", photo: "1514436864212-7c1f9f1cb21b" }] },

  // Chemises
  { name: "Chemise Oxford", description: "Chemise en coton Oxford, col boutonné et coupe ajustée. Se porte au bureau comme le week-end.", price: 69, gender: "HOMME", category: "Chemises", sizes: CLOTHING,
    colors: [{ name: "Bleu ciel", photo: "1624835567150-0c530a20d8cc" }, { name: "Blanc", photo: "1627686011747-74adda3d2343" }] },
  { name: "Chemise en jean", description: "Chemise en denim léger, deux poches poitrine et boutons pression.", price: 75, gender: "HOMME", category: "Chemises", sizes: CLOTHING,
    colors: [{ name: "Indigo", photo: "1613752978317-afcfd1bba65a" }, { name: "Délavé", photo: "1761426857312-7931f596e6f3" }] },

  // Pulls
  { name: "Pull en laine mérinos", description: "Pull fin en laine mérinos extra-fine, thermorégulant et respirant. Se porte seul ou en superposition.", price: 79, gender: "HOMME", category: "Pulls", sizes: CLOTHING,
    colors: [{ name: "Noir", photo: "1614495039268-aa9a80429b66" }, { name: "Chocolat", photo: "1692529487714-4e938cc6322f" }] },
  { name: "Cardigan maille torsadée", description: "Cardigan boutonné en maille épaisse, mélange laine et alpaga pour une chaleur sans poids.", price: 95, gender: "FEMME", category: "Pulls", sizes: CLOTHING,
    colors: [{ name: "Camel", photo: "1568125789396-c17c53160be5" }, { name: "Écru", photo: "1616522431599-568dfc895b6b" }] },
  { name: "Sweat à capuche molleton", description: "Sweat à capuche en molleton gratté, poche kangourou et cordons plats.", price: 65, gender: "UNISEXE", category: "Pulls", sizes: CLOTHING,
    colors: [{ name: "Rose poudré", photo: "1779676086744-a83b1f0e00bd" }, { name: "Gris chiné", photo: "1556821840-3a63f95609a7" }, { name: "Sable", photo: "1564557287817-3785e38ec1f5" }] },

  // Robes & jupes
  { name: "Robe en lin", description: "Robe courte en lin lavé, manches courtes et ceinture à nouer. Fraîche et légère.", price: 89, gender: "FEMME", category: "Robes & jupes", sizes: CLOTHING,
    colors: [{ name: "Blanc", photo: "1789110520302-3df8ce0410f0" }, { name: "Terracotta", photo: "1789110853833-bc1a883da2d6" }, { name: "Naturel", photo: "1747396206869-75ea57b325ce" }] },
  { name: "Robe longue en maille", description: "Robe longue en maille côtelée, manches longues et coupe près du corps.", price: 99, gender: "FEMME", category: "Robes & jupes", sizes: CLOTHING,
    colors: [{ name: "Noir", photo: "1759229874810-26aa9a3dda92" }, { name: "Crème", photo: "1777888511107-7e06dd1808dd" }] },
  { name: "Robe fleurie", description: "Robe midi à imprimé floral, col en V et manches longues. Viscose fluide.", price: 85, gender: "FEMME", category: "Robes & jupes", sizes: CLOTHING,
    colors: [{ name: "Blanc fleuri", photo: "1502868354157-ec2edd2a1651" }, { name: "Noir fleuri", photo: "1616313253719-c46514cddee1" }] },
  { name: "Jupe longue plissée", description: "Jupe longue plissée en voile, taille élastiquée. Un mouvement léger à chaque pas.", price: 69, gender: "FEMME", category: "Robes & jupes", sizes: CLOTHING,
    colors: [{ name: "Blanc", photo: "1762343041573-aa2827852bc9" }] },

  // Pantalons
  { name: "Jean droit brut", description: "Jean coupe droite en denim brut 13,5 oz, se patine avec le temps. Cinq poches, braguette à boutons.", price: 89, gender: "HOMME", category: "Pantalons", sizes: TROUSERS,
    colors: [{ name: "Indigo", photo: "1626876880576-9990b14f0534" }] },
  { name: "Pantalon large en lin", description: "Pantalon fluide à jambes larges en lin lavé, taille élastiquée et poches côtés.", price: 69, gender: "FEMME", category: "Pantalons", sizes: CLOTHING,
    colors: [{ name: "Sable", photo: "1789110853687-71692f0e86be" }] },
  { name: "Chino slim stretch", description: "Chino en twill de coton stretch, coupe slim confortable pour toute la journée.", price: 59, gender: "HOMME", category: "Pantalons", sizes: TROUSERS,
    colors: [{ name: "Olive", photo: "1787435906030-f52e34c2b440" }, { name: "Beige", photo: "1473966968600-fa801b869a1a", crop: "bottom" }] },

  // Vestes
  { name: "Veste en jean oversize", description: "Veste en denim délavé, coupe ample, boutons métalliques et poches poitrine.", price: 99, gender: "FEMME", category: "Vestes", sizes: CLOTHING,
    colors: [{ name: "Bleu clair", photo: "1577660002965-04865592fc60" }] },
  { name: "Trench imperméable", description: "Trench mi-long en gabardine de coton déperlant, ceinture à nouer et double boutonnage.", price: 189, gender: "FEMME", category: "Vestes", sizes: CLOTHING,
    colors: [{ name: "Beige", photo: "1633821879282-0c4e91f96232" }, { name: "Camel", photo: "1777445852567-02224ea87655" }] },
  { name: "Blazer oversize", description: "Blazer à épaules structurées et coupe ample, en laine mélangée. Fermeture un bouton.", price: 149, gender: "FEMME", category: "Vestes", sizes: CLOTHING,
    colors: [{ name: "Noir", photo: "1779400201925-6c6048bee7e5" }, { name: "Beige", photo: "1590873802674-55bb8f947bc5" }] },
  { name: "Manteau droit en laine", description: "Manteau droit mi-long en drap de laine, col tailleur et deux poches à rabat.", price: 219, gender: "HOMME", category: "Vestes", sizes: CLOTHING,
    colors: [{ name: "Camel", photo: "1619603364937-8d7af41ef206" }, { name: "Gris anthracite", photo: "1787045098569-2e17ae871df4" }] },
  { name: "Doudoune légère", description: "Doudoune matelassée ultra-légère, garnissage synthétique recyclé. Se range dans sa poche.", price: 129, gender: "HOMME", category: "Vestes", sizes: CLOTHING,
    colors: [{ name: "Noir", photo: "1614031679232-0dae776a72ee" }] },

  // Chaussures
  { name: "Baskets cuir minimalistes", description: "Baskets basses en cuir pleine fleur, semelle en caoutchouc cousue. Design épuré.", price: 129, gender: "UNISEXE", category: "Chaussures", sizes: SHOES,
    colors: [{ name: "Blanc", photo: "1608384177866-0bca0d225435", crop: "bottom" }, { name: "Noir", photo: "1771711103291-67c2542a34f0" }] },
  { name: "Bottines Chelsea", description: "Bottines Chelsea en cuir, élastiques latéraux et semelle crantée antidérapante.", price: 149, gender: "UNISEXE", category: "Chaussures", sizes: SHOES,
    colors: [{ name: "Marron", photo: "1577387224391-5de31164a0e0" }, { name: "Noir", photo: "1615737168659-247ede7a7c9b", crop: "bottom" }] },
  { name: "Mocassins en cuir", description: "Mocassins en cuir souple, semelle cousue Blake. Se portent pieds nus ou avec des chaussettes fines.", price: 139, gender: "UNISEXE", category: "Chaussures", sizes: SHOES,
    colors: [{ name: "Noir", photo: "1760616172899-0681b97a2de3", crop: "bottom" }, { name: "Cognac", photo: "1616406432452-07bc5938759d" }, { name: "Sable", photo: "1556004583-d2aaffbba592", crop: "bottom" }] },

  // Accessoires
  { name: "Bonnet côtelé", description: "Bonnet en maille côtelée laine et cachemire, revers large.", price: 29, gender: "UNISEXE", category: "Accessoires", sizes: ONE_SIZE,
    colors: [{ name: "Gris", photo: "1548612621-77df2f2c5246" }, { name: "Écru", photo: "1517255996494-6cc16ba8230c" }] },
  { name: "Écharpe en laine", description: "Grande écharpe tissée en laine d'agneau, motif à carreaux et finitions franges.", price: 45, gender: "UNISEXE", category: "Accessoires", sizes: ONE_SIZE,
    colors: [{ name: "Beige", photo: "1609362065704-0e1da86d582a" }] },
  { name: "Sac cabas en toile", description: "Cabas en toile de coton épaisse, grandes anses et poche intérieure zippée.", price: 55, gender: "FEMME", category: "Accessoires", sizes: ONE_SIZE,
    colors: [{ name: "Écru", photo: "1544816155-12df9643f363" }, { name: "Noir", photo: "1578237493287-8d4d2b03591a" }] },
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
  await prisma.productImage.deleteMany();
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

  const categories = new Map<string, number>();
  for (const c of CATEGORIES) {
    const category = await prisma.category.create({
      data: { name: c.name, slug: slugify(c.name), imageUrl: unsplash(c.photo) },
    });
    categories.set(c.name, category.id);
  }

  let variantIndex = 0;
  for (const [i, p] of PRODUCTS.entries()) {
    await prisma.product.create({
      data: {
        name: p.name,
        slug: slugify(p.name),
        description: p.description,
        priceCents: p.price * 100,
        imageUrl: unsplash(p.colors[0].photo, p.colors[0].crop),
        gender: p.gender,
        categoryId: categories.get(p.category)!,
        createdAt: new Date(Date.now() - i * 86_400_000),
        images: { create: p.colors.map((c) => ({ color: c.name, url: unsplash(c.photo, c.crop) })) },
        variants: {
          create: p.colors.flatMap((c) => p.sizes.map((size) => ({ color: c.name, size, stock: stockFor(variantIndex++) }))),
        },
      },
    });
  }

  console.log(`✔ ${CATEGORIES.length} catégories, ${PRODUCTS.length} produits, 2 utilisateurs créés`);
  console.log("  Admin  : admin@maisonlune.fr / Admin12345!");
  console.log("  Client : client@maisonlune.fr / Client12345!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
