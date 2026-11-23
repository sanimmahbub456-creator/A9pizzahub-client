# PizzaHub 🍕 Pizza Ordering & Delivery Platform

PizzaHub connects hungry customers with local pizzerias. Customers browse and order, vendors publish menus and manage orders, and admins moderate everything.
ADMIN_EMAIL=admin@pizzahub.com
ADMIN_PASSWORD=Admin123

LIVE_SITE=https://a9pizzahub-client.vercel.app

SERVER_REPO=https://github.com/sanimmahbub456-creator/A9pizzahub-server

CLIENT_REPO=https://github.com/sanimmahbub456-creator/A9pizzahub-client

# Stripe Test Card (Vendor Premium Upgrade)
STRIPE_TEST_CARD=4242424242424242
EXPIRY_DATE=12/34
CVC=123

## Key features

- **Three roles** (Customer, Vendor, Admin), each with its own protected dashboard. Changing the URL to another role's dashboard redirects back
- **Better Auth**: email/password + Google login, password rules (6+ chars, upper & lower case), role chosen at sign-up, admin never selectable
- **Reload-safe private routes**: a cookie check in `proxy.ts` runs before render, and server layouts check the session and role
- **Browse Menu**: search, category and location filters, price range, sort by price (asc/desc), pagination, loading and empty states
- **Item details** with an image gallery and order form (delivery date, address, special instructions, Cash on Delivery)
- **Vendor dashboard**: overview + charts, add/edit/delete items with ImgBB multi-image upload, availability toggle, accept/reject orders, Stripe Premium subscription
- **Customer dashboard**: overview + chart, my orders, cancel pending orders, order details with a **status timeline**
- **Admin dashboard**: platform stats + charts, manage users (search, role filter, details, block/unblock), approve/reject/deactivate/delete items, read-only transactions
- **Premium plan** via Stripe Checkout. Activation happens only after the server receives a verified webhook. Premium vendors get a badge and featured homepage placement
- **Dark / light mode**, Framer Motion animations, toast notifications, custom 404 and error pages, fully responsive

Optional features implemented: **Dark/light mode toggle** and **Order status timeline**.

## Tech stack

| Package | Purpose |
| --- | --- |
| next 16 (App Router), react 19, typescript | Framework |
| better-auth (+ mongodb adapter, JWT plugin) | Authentication, Google OAuth, JWT for the API |
| mongodb | Better Auth database |
| tailwindcss 4, Radix UI (shadcn/ui components), class-variance-authority, lucide-react | UI |
| motion (Framer Motion) | Animations |
| recharts | Dashboard charts |
| sonner | Toasts |
| next-themes | Dark mode |
| @fontsource-variable/fraunces, plus-jakarta-sans | Fonts |

## Environment variables

Create `.env.local` (see `.env.example`). **Never commit it.**

```
BETTER_AUTH_URL=            # this app's URL, no trailing slash
NEXT_PUBLIC_APP_URL=        # same as above
BETTER_AUTH_SECRET=         # openssl rand -base64 32
MONGODB_URI=
DB_NAME=pizzahub
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_API_URL=        # Express server URL
IMGBB_API_KEY=              # server-only; uploads go through /api/upload
```

## Run locally

```bash
git clone https://github.com/sanimmahbub456-creator/A9pizzahub-client.git
cd A9pizzahub-client
npm install
cp .env.example .env.local   # fill in values
npm run dev                  # http://localhost:3000
```

Start the server too (see the server README). Google OAuth redirect URI: `http://localhost:3000/api/auth/callback/google`.

## How auth works between Next.js and Express

1. Better Auth runs inside Next.js (`/api/auth/*`) and stores users/sessions in MongoDB (`users` collection).
2. The browser asks Better Auth for a short-lived JWT (`authClient.token()`), cached in memory and refreshed automatically.
3. Every private API call sends `Authorization: Bearer <jwt>`.
4. Express verifies the signature against Better Auth's public JWKS (`/api/auth/jwks`), then loads the user's **role from the database**.

## Challenge implementation notes

- **Advanced search & sorting:** `src/components/menu/BrowseMenu.tsx` keeps every filter in the URL (`?search=&category=&location=&minPrice=&maxPrice=&sort=price_asc&page=2`), so the page survives reloads and can be shared. Text inputs are debounced. The query string is passed straight to `GET /api/menu` on the server.
- **JWT verification:** see the server README for the middleware flow (`verifyJWT → requireRole → ownership check`). Invalid or expired tokens return `401`. The client retries once with a fresh token.

## Test credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@…` | `…` |
| Vendor | `vendor@…` | `…` |
| Customer | `customer@…` | `…` |

Stripe test card: `4242 4242 4242 4242`, any future date, any CVC.
