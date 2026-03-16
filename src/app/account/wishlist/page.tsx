import { Heart } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";

export const metadata = {
  title: "My Wishlist | BNs Fashion Wear",
};

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/account/wishlist");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/account" className="text-muted hover:text-charcoal text-sm">
          &larr; Back to Account
        </Link>
      </div>
      
      <div className="bg-white border border-sand p-10 text-center">
        <Heart size={48} className="mx-auto text-sand mb-4" />
        <h1 className="font-display text-2xl font-light mb-2">
          Your Wishlist
        </h1>
        <p className="text-muted mb-6">
          The wishlist feature is coming soon! Keep an eye out for updates.
        </p>
        <Link href="/shop" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
