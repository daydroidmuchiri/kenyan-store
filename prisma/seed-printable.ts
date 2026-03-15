// prisma/seed-printable.ts
// Seed printable products for the print-on-demand feature

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COMMON_COLORS = [
  { name: "White", hex: "#ffffff", mockupUrl: "placeholder" },
  { name: "Black", hex: "#1a1a1a", mockupUrl: "placeholder" },
  { name: "Navy Blue", hex: "#1e3a5f", mockupUrl: "placeholder" },
  { name: "Forest Green", hex: "#2d5a27", mockupUrl: "placeholder" },
  { name: "Sand", hex: "#c2a98b", mockupUrl: "placeholder" },
  { name: "Red", hex: "#d32f2f", mockupUrl: "placeholder" },
];

const PRINTABLE_PRODUCTS = [
  {
    name: "Classic T-Shirt",
    slug: "classic-tshirt",
    description: "Premium 100% cotton t-shirt, 200gsm. Comfortable, durable, and ideal for custom prints.",
    basePrice: 1500,
    printSurcharge: 500,
    mockupImageUrl: "/placeholder-tshirt.png", // Will be rendered by SVG
    printAreaX: 30,
    printAreaY: 25,
    printAreaWidth: 40,
    printAreaHeight: 35,
    availableColors: COMMON_COLORS,
    availableSizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Premium Hoodie",
    slug: "premium-hoodie",
    description: "Heavy-weight 300gsm fleece hoodie. Warm, soft, and built to last. Perfect for bold custom artwork.",
    basePrice: 2500,
    printSurcharge: 600,
    mockupImageUrl: "/placeholder-hoodie.png",
    printAreaX: 33,
    printAreaY: 36,
    printAreaWidth: 33,
    printAreaHeight: 25,
    availableColors: [
      { name: "White", hex: "#ffffff", mockupUrl: "placeholder" },
      { name: "Black", hex: "#1a1a1a", mockupUrl: "placeholder" },
      { name: "Charcoal", hex: "#36454f", mockupUrl: "placeholder" },
      { name: "Burgundy", hex: "#800020", mockupUrl: "placeholder" },
    ],
    availableSizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Polo Shirt",
    slug: "polo-shirt",
    description: "Smart piqué polo shirt. Professional and versatile — great for branded team wear or personal designs.",
    basePrice: 1800,
    printSurcharge: 500,
    mockupImageUrl: "/placeholder-polo.png",
    printAreaX: 33,
    printAreaY: 33,
    printAreaWidth: 33,
    printAreaHeight: 30,
    availableColors: [
      { name: "White", hex: "#ffffff", mockupUrl: "placeholder" },
      { name: "Navy", hex: "#1e3a5f", mockupUrl: "placeholder" },
      { name: "Black", hex: "#1a1a1a", mockupUrl: "placeholder" },
      { name: "Grey", hex: "#808080", mockupUrl: "placeholder" },
    ],
    availableSizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Cargo Pants",
    slug: "cargo-pants",
    description: "Durable cotton twill cargo pants with multiple pockets. Print available on the lower left leg.",
    basePrice: 3000,
    printSurcharge: 600,
    mockupImageUrl: "/placeholder-cargo.png",
    printAreaX: 31,
    printAreaY: 14,
    printAreaWidth: 37,
    printAreaHeight: 16,
    availableColors: [
      { name: "Black", hex: "#1a1a1a", mockupUrl: "placeholder" },
      { name: "Khaki", hex: "#c3b091", mockupUrl: "placeholder" },
      { name: "Olive", hex: "#4b5320", mockupUrl: "placeholder" },
      { name: "Navy", hex: "#1e3a5f", mockupUrl: "placeholder" },
    ],
    availableSizes: ["28", "30", "32", "34", "36", "38"],
  },
  {
    name: "Canvas Tote Bag",
    slug: "canvas-tote",
    description: "Natural cotton canvas tote bag with large print area. Eco-friendly, reusable, and stylish.",
    basePrice: 800,
    printSurcharge: 400,
    mockupImageUrl: "/placeholder-tote.png",
    printAreaX: 27,
    printAreaY: 32,
    printAreaWidth: 46,
    printAreaHeight: 38,
    availableColors: [
      { name: "Natural", hex: "#e8d5b7", mockupUrl: "placeholder" },
      { name: "Black", hex: "#1a1a1a", mockupUrl: "placeholder" },
      { name: "Navy", hex: "#1e3a5f", mockupUrl: "placeholder" },
    ],
    availableSizes: ["ONE SIZE"],
  },
];

async function main() {
  console.log("🖨️ Seeding printable products...");

  for (const p of PRINTABLE_PRODUCTS) {
    const existing = await prisma.printableProduct.findUnique({
      where: { slug: p.slug },
    });

    if (existing) {
      console.log(`⏩ Updating existing: ${p.name}`);
      await prisma.printableProduct.update({
        where: { slug: p.slug },
        data: {
          name: p.name,
          description: p.description,
          basePrice: p.basePrice,
          printSurcharge: p.printSurcharge,
          mockupImageUrl: p.mockupImageUrl,
          printAreaX: p.printAreaX,
          printAreaY: p.printAreaY,
          printAreaWidth: p.printAreaWidth,
          printAreaHeight: p.printAreaHeight,
          availableColors: p.availableColors,
          availableSizes: p.availableSizes,
        },
      });
      continue;
    }

    const product = await prisma.printableProduct.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        basePrice: p.basePrice,
        printSurcharge: p.printSurcharge,
        mockupImageUrl: p.mockupImageUrl,
        printAreaX: p.printAreaX,
        printAreaY: p.printAreaY,
        printAreaWidth: p.printAreaWidth,
        printAreaHeight: p.printAreaHeight,
        availableColors: p.availableColors,
        availableSizes: p.availableSizes,
        isActive: true,
      },
    });

    console.log(`✅ Created: ${product.name} (${product.slug})`);
  }

  console.log("\n🎉 Printable products seeded!");
  console.log("─────────────────────────────────────────");
  console.log("Products available at: /custom-print");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
