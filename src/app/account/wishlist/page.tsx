import { Heart } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import prisma from "@/lib/db/prisma";
import { WishlistClient } from "./WishlistClient";

export const metadata = {
  title: "My Wishlist | BNs Fashion Wear",
};

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/account/wishlist");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/login");
  }

  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: {
          images: {
            orderBy: { position: "asc" },
            take: 2,
          },
          category: true,
          variants: true,
          reviews: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const products = wishlistItems.map(item => item.product);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/account" className="text-muted hover:text-charcoal text-sm">
          &larr; Back to Account
        </Link>
      </div>
      
      <WishlistClient initialProducts={products} />
    </div>
  );
}
