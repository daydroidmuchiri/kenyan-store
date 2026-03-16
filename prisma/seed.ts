// prisma/seed.ts
// Seed the database with sample data for development

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── ADMIN USER ──────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@BNs Fashion Wear.co.ke" },
    update: {},
    create: {
      email: "admin@BNs Fashion Wear.co.ke",
      name: "BNs Fashion Wear Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user:", admin.email);

  // ── CATEGORIES ───────────────────────────────────────────────────────────
  const women = await prisma.category.upsert({
    where: { slug: "women" },
    update: {},
    create: { name: "Women", slug: "women", description: "Premium women's fashion" },
  });
  const men = await prisma.category.upsert({
    where: { slug: "men" },
    update: {},
    create: { name: "Men", slug: "men", description: "Men's contemporary fashion" },
  });
  const accessories = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: { name: "Accessories", slug: "accessories", description: "Bags, belts and more" },
  });
  console.log("✅ Categories seeded");

  // ── SAMPLE PRODUCTS ───────────────────────────────────────────────────────
  const products = [
    {
      name: "Ankara Print Wrap Dress",
      slug: "ankara-print-wrap-dress",
      description: "A stunning wrap dress crafted from vibrant Ankara print fabric. Perfect for both casual outings and special events. The wrap design is universally flattering and the bold African prints make a statement wherever you go.",
      price: 3500,
      comparePrice: 4500,
      categoryId: women.id,
      brand: "BNs Fashion Wear",
      material: "100% Cotton Ankara fabric",
      careInstructions: "Hand wash cold. Do not bleach. Iron on low heat.",
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1594938298603-c8148c4b4869?w=600&h=800&fit=crop",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop",
      ],
      sizes: ["XS", "S", "M", "L", "XL"],
    },
    {
      name: "Classic Linen Blazer",
      slug: "classic-linen-blazer",
      description: "A modern, lightweight linen blazer perfect for Nairobi's climate. Tailored for a sharp, professional look that transitions seamlessly from the office to evening events.",
      price: 7500,
      comparePrice: null,
      categoryId: men.id,
      brand: "BNs Fashion Wear",
      material: "70% Linen, 30% Cotton",
      careInstructions: "Dry clean recommended. Iron on medium heat.",
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&h=800&fit=crop",
        "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=600&h=800&fit=crop",
      ],
      sizes: ["S", "M", "L", "XL", "XXL"],
    },
    {
      name: "Kitenge Tote Bag",
      slug: "kitenge-tote-bag",
      description: "Handcrafted tote bag made from authentic Kenyan kitenge fabric. Spacious enough for daily essentials with a beautiful cultural aesthetic.",
      price: 1800,
      comparePrice: 2200,
      categoryId: accessories.id,
      brand: "BNs Fashion Wear",
      material: "Kitenge fabric with leather handles",
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop",
      ],
      sizes: ["ONE SIZE"],
    },
    {
      name: "Maasai-Inspired Shirt",
      slug: "maasai-inspired-shirt",
      description: "A contemporary shirt inspired by Maasai color traditions. Made from premium cotton with vibrant red and blue patterns. Celebrates Kenyan heritage with modern styling.",
      price: 2800,
      comparePrice: null,
      categoryId: men.id,
      brand: "BNs Fashion Wear",
      material: "100% Premium Cotton",
      careInstructions: "Machine wash cold. Tumble dry low.",
      isFeatured: true,
      images: [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop",
      ],
      sizes: ["S", "M", "L", "XL"],
    },
    {
      name: "Floral Midi Skirt",
      slug: "floral-midi-skirt",
      description: "Elegant midi skirt with a vibrant floral print inspired by East African gardens. Pairs beautifully with a simple top or tucked-in blouse for a complete look.",
      price: 2200,
      comparePrice: 2800,
      categoryId: women.id,
      brand: "BNs Fashion Wear",
      material: "95% Polyester, 5% Spandex",
      careInstructions: "Machine wash cold on gentle cycle.",
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1583496661160-fb5218afa9a9?w=600&h=800&fit=crop",
      ],
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    },
    {
      name: "Premium Chino Trousers",
      slug: "premium-chino-trousers",
      description: "Slim-fit chino trousers made from high-quality stretch cotton. Versatile enough for both smart-casual and semi-formal occasions. Available in multiple sizes.",
      price: 3200,
      comparePrice: null,
      categoryId: men.id,
      brand: "BNs Fashion Wear",
      material: "98% Cotton, 2% Elastane",
      careInstructions: "Machine wash cold. Hang dry.",
      isFeatured: false,
      images: [
        "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=800&fit=crop",
      ],
      sizes: ["28", "30", "32", "34", "36", "38"],
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      console.log(`⏩ Skipping existing product: ${p.name}`);
      continue;
    }

    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice,
        categoryId: p.categoryId,
        brand: p.brand,
        material: p.material,
        careInstructions: p.careInstructions,
        isFeatured: p.isFeatured,
        isActive: true,
        images: {
          create: p.images.map((url, i) => ({
            url,
            alt: `${p.name} image ${i + 1}`,
            position: i,
          })),
        },
        variants: {
          create: p.sizes.map((size) => ({
            size,
            stock: Math.floor(Math.random() * 15) + 5,
            sku: `${p.slug.toUpperCase().slice(0, 6)}-${size}`,
          })),
        },
      },
    });
    console.log(`✅ Created product: ${product.name}`);
  }

  console.log("\n🎉 Seeding complete!");
  console.log("─────────────────────────────────────────");
  console.log("Admin login:");
  console.log("  Email:    admin@BNs Fashion Wear.co.ke");
  console.log("  Password: Admin@123");
  console.log("─────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
