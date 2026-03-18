import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import prisma from "@/lib/db/prisma";
import { ProductForm } from "./ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Add New Product | Admin",
};

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || user?.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch categories to populate the dropdown
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/admin/products" 
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-charcoal transition-colors mb-4"
        >
          <ChevronLeft size={16} />
          Back to Products
        </Link>
        <h1 className="font-display text-3xl font-light">Add New Product</h1>
        <p className="text-muted text-sm mt-1">Create a new item in your catalog and set inventory levels.</p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
