import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { Plus, Search, MoreHorizontal, Edit, Trash } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "Products Management | Admin",
};

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || user?.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch all products with their categories and variant counts
  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: {
        orderBy: { position: "asc" },
        take: 1,
      },
      variants: {
        select: { stock: true }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-light">Products</h1>
          <p className="text-muted text-sm mt-1">Manage your catalog, pricing, and inventory.</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary gap-2 shrink-0">
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      <div className="bg-white border border-sand">
        <div className="p-4 border-b border-sand flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-sand bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-600 transition-colors"
            />
          </div>
          <div className="text-sm text-muted">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-sand text-left text-xs uppercase tracking-wider text-muted font-medium">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Inventory</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted">
                    No products found. Start by adding one!
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                  const isOutOfStock = totalStock === 0;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-16 bg-sand relative overflow-hidden flex-shrink-0">
                            {product.images[0] ? (
                              <Image 
                                src={product.images[0].url} 
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-muted text-xs">
                                No image
                              </div>
                            )}
                          </div>
                          <div>
                            <Link href={`/product/${product.slug}`} className="font-medium text-charcoal hover:text-brand-600 transition-colors block">
                              {product.name}
                            </Link>
                            <span className="text-xs text-muted mt-0.5 block">{product.brand || 'No brand'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-sm ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {product.isActive ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-charcoal">
                        {isOutOfStock ? (
                          <span className="text-red-600 font-medium">Out of stock</span>
                        ) : (
                          <span>{totalStock} in stock</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted">
                        {product.category.name}
                      </td>
                      <td className="px-6 py-4 font-medium text-charcoal">
                        {formatPrice(Number(product.price))}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-muted hover:text-brand-600 transition-colors" title="Edit Product">
                            <Edit size={16} />
                          </button>
                          <button className="p-1.5 text-muted hover:text-red-600 transition-colors" title="Delete Product">
                            <Trash size={16} />
                          </button>
                        </div>
                        <button className="p-1.5 text-muted hover:text-charcoal group-hover:hidden transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
