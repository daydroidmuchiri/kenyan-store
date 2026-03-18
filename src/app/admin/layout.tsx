import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth/auth.config";
import { AdminSidebar } from "./AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!session || user?.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Admin Nav Header */}
      <header className="bg-charcoal text-cream px-6 py-4 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-display text-xl font-semibold tracking-widest"
          >
            BNs Fashion Wear
          </Link>
          <span className="text-white/30">|</span>
          <span className="text-sm text-white/70">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/shop" className="text-sm text-white/70 hover:text-white transition-colors">
            View Store
          </Link>
          <div className="w-px h-4 bg-white/20 mx-2" />
          <span className="text-sm text-white/80 font-medium">{user?.name || user?.email}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content scroll area */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
