# KWELI Fashion — Kenya E-Commerce Platform

A production-quality fashion e-commerce platform built for the Kenyan market. Features M-Pesa STK Push payments, Kenya-wide delivery options, and a premium African-inspired design.

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js |
| Payments | M-Pesa Daraja API + Stripe |
| Images | Cloudinary |
| Validation | Zod |
| State | Zustand |
| Deploy | Vercel |

## 📁 Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Home page
│   ├── shop/page.tsx           # Product listing
│   ├── product/[slug]/page.tsx # Product detail
│   ├── cart/page.tsx           # Cart page
│   ├── checkout/page.tsx       # Checkout + M-Pesa
│   ├── confirmation/page.tsx   # Order confirmation
│   ├── login/page.tsx          # Login
│   ├── register/page.tsx       # Register
│   ├── account/page.tsx        # Customer dashboard
│   ├── delivery/page.tsx       # Delivery & Returns
│   ├── about/page.tsx          # About page
│   ├── contact/page.tsx        # Contact
│   ├── admin/dashboard/        # Admin dashboard
│   └── api/                    # API routes
│       ├── auth/               # NextAuth + register
│       ├── orders/             # Order creation
│       └── payments/
│           ├── mpesa/          # STK Push, callback, status
│           └── stripe/         # Stripe sessions
├── components/
│   ├── layout/                 # Navbar, Footer
│   ├── product/                # ProductCard, ProductDetail, Filters
│   ├── cart/                   # CartSidebar
│   ├── shared/                 # Providers, WhatsAppButton
│   └── auth/                   # Auth components
├── hooks/
│   └── use-cart.ts             # Zustand cart + wishlist
├── lib/
│   ├── auth/auth.config.ts     # NextAuth config
│   ├── db/prisma.ts            # Prisma client
│   ├── payments/mpesa.ts       # M-Pesa Daraja service
│   ├── utils/index.ts          # Formatters, helpers
│   └── validation/schemas.ts  # Zod schemas
└── types/index.ts              # TypeScript types

prisma/
├── schema.prisma               # Database schema
└── seed.ts                     # Sample data seeder
```

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <your-repo>
cd kenyan-store
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your values in `.env.local` (see `.env.example` for all required variables).

### 3. Database Setup

```bash
# Push schema to your PostgreSQL database
npm run db:push

# Generate Prisma client
npm run db:generate

# Seed with sample data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Default admin credentials:**
- Email: `admin@kweli.co.ke`
- Password: `Admin@123`

## 🔑 Required API Keys

### M-Pesa (Safaricom Daraja)
1. Register at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create an app → get Consumer Key & Consumer Secret
3. For sandbox, use shortcode `174379`
4. For production, use your registered PayBill/Till number
5. Set `MPESA_CALLBACK_URL` to your publicly accessible domain

### Stripe
1. Create account at [stripe.com](https://stripe.com)
2. Get test keys from Dashboard → Developers → API keys
3. Use Stripe CLI for webhook testing locally

### Cloudinary
1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get Cloud Name, API Key, API Secret from dashboard

### PostgreSQL
- Local: Install PostgreSQL and create a database
- Production: Use [Supabase](https://supabase.com) (free tier available)

## 💳 M-Pesa Integration

The M-Pesa integration uses the **Safaricom Daraja API** with STK Push (Lipa na M-Pesa Online):

```
Customer → Select M-Pesa → Enter phone → Submit order
  ↓
Server creates order → Calls Daraja STK Push API
  ↓
Customer receives prompt on phone → Enters M-Pesa PIN
  ↓
Safaricom calls our callback URL → We update order status
  ↓
Frontend polls /api/payments/mpesa/status → Redirects on success
```

**For local development**, use [ngrok](https://ngrok.com) to expose your localhost:
```bash
ngrok http 3000
# Then set NEXT_PUBLIC_SITE_URL to your ngrok URL
```

## 🚢 Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Set all environment variables in Vercel dashboard → Settings → Environment Variables.

Make sure your M-Pesa callback URL uses your production domain:
```
NEXT_PUBLIC_SITE_URL=https://your-domain.co.ke
```

## 📦 Key Features

- ✅ M-Pesa STK Push with real-time status polling
- ✅ Stripe card payments
- ✅ Cash on delivery option
- ✅ Kenya-wide delivery zones (Nairobi, Outside Nairobi, Pickup)
- ✅ Product catalog with filtering, search, pagination
- ✅ Shopping cart with Zustand (persisted to localStorage)
- ✅ Wishlist
- ✅ Customer accounts (email + Google OAuth)
- ✅ Admin dashboard with sales stats
- ✅ Order management
- ✅ SEO with structured data (JSON-LD)
- ✅ Sitemap generation
- ✅ WhatsApp support button
- ✅ Mobile-first responsive design
- ✅ ARIA accessibility
- ✅ Security headers

## 🔐 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT sessions via NextAuth
- Server-side validation with Zod on all API routes
- Route protection via Next.js middleware
- Environment variables for all secrets
- CSRF protection via NextAuth
- Security headers set in `next.config.mjs`

## 📊 Admin Access

Navigate to `/admin/dashboard` after logging in with an ADMIN role account.

Features:
- Sales overview (revenue, orders, customers)
- Recent orders table
- Quick links to product and order management

## 🤝 Contributing

Pull requests welcome! Please open an issue first to discuss major changes.

## 📄 License

MIT © KWELI Fashion
