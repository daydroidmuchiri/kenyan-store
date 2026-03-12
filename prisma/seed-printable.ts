// prisma/seed-printable.ts
// Seed printable products for the print-on-demand feature

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COMMON_COLORS = [
  { name: "White", hex: "#ffffff", mockupUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop" },
  { name: "Black", hex: "#1a1a1a", mockupUrl: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=600&fit=crop" },
  { name: "Navy Blue", hex: "#1e3a5f", mockupUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&h=600&fit=crop" },
  { name: "Forest Green", hex: "#2d5a27", mockupUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&h=600&fit=crop" },
  { name: "Sand", hex: "#c2a98b", mockupUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500&h=600&fit=crop" },
];

const PRINTABLE_PRODUCTS = [
  {
    name: "Classic T-Shirt",
    slug: "classic-tshirt",
    description: "Premium 100% cotton t-shirt, 200gsm. Comfortable, durable, and ideal for custom prints. Available in 5 colors.",
    basePrice: 1200,
    printSurcharge: 800,
    // Using placeholder mockup — in production, use your actual garment photos
    mockupImageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
    // Print area as % of the 500×600 canvas
    // Chest area of a t-shirt is roughly: x=30%, y=25%, w=40%, h=35%
    printAreaX: 28,
    printAreaY: 22,
    printAreaWidth: 44,
    printAreaHeight: 38,
    availableColors: COMMON_COLORS,
    availableSizes: ["XS", "S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Premium Hoodie",
    slug: "premium-hoodie",
    description: "Heavy-weight 300gsm fleece hoodie. Warm, soft, and built to last. Perfect for bold custom artwork.",
    basePrice: 2500,
    printSurcharge: 1000,
    mockupImageUrl: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&h=600&fit=crop",
    printAreaX: 30,
    printAreaY: 28,
    printAreaWidth: 40,
    printAreaHeight: 32,
    availableColors: [
      { name: "Black", hex: "#1a1a1a", mockupUrl: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&h=600&fit=crop" },
      { name: "Charcoal", hex: "#36454f", mockupUrl: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&h=600&fit=crop" },
      { name: "White", hex: "#ffffff", mockupUrl: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=500&h=600&fit=crop" },
      { name: "Maroon", hex: "#800000", mockupUrl: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&h=600&fit=crop" },
    ],
    availableSizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    name: "Canvas Tote Bag",
    slug: "canvas-tote",
    description: "Natural cotton canvas tote bag with large print area. Eco-friendly, reusable, and stylish.",
    basePrice: 800,
    printSurcharge: 600,
    mockupImageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=600&fit=crop",
    printAreaX: 22,
    printAreaY: 20,
    printAreaWidth: 56,
    printAreaHeight: 50,
    availableColors: [
      { name: "Natural", hex: "#e8d5b7", mockupUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=600&fit=crop" },
      { name: "Black", hex: "#1a1a1a", mockupUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=600&fit=crop" },
    ],
    availableSizes: ["ONE SIZE"],
  },
  {
    name: "Polo Shirt",
    slug: "polo-shirt",
    description: "Smart piqué polo shirt. Professional and versatile — great for branded team wear or personal designs.",
    basePrice: 1800,
    printSurcharge: 700,
    mockupImageUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&h=600&fit=crop",
    printAreaX: 35,
    printAreaY: 20,
    printAreaWidth: 30,
    printAreaHeight: 25,
    availableColors: [
      { name: "White", hex: "#ffffff", mockupUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&h=600&fit=crop" },
      { name: "Navy", hex: "#1e3a5f", mockupUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&h=600&fit=crop" },
      { name: "Black", hex: "#1a1a1a", mockupUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&h=600&fit=crop" },
    ],
    availableSizes: ["S", "M", "L", "XL", "XXL"],
  },
];

async function main() {
  console.log("🖨️ Seeding printable products...");

  for (const p of PRINTABLE_PRODUCTS) {
    const existing = await prisma.printableProduct.findUnique({
      where: { slug: p.slug },
    });

    if (existing) {
      console.log(`⏩ Skipping existing: ${p.name}`);
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
