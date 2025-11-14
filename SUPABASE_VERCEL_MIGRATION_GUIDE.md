# 🚀 QuickFlip AI - Supabase + Vercel Migration Guide

## 📋 **Overview**

This guide provides a **complete, production-ready setup** for migrating from Firebase to **Supabase + Vercel** with full authentication, database, storage, and listing management.

**What you'll get:**
- ✅ **Authentication** (email magic links)
- ✅ **Database tables** with Row Level Security (RLS)
- ✅ **File storage** for listing photos
- ✅ **Create listing page** with photo uploads
- ✅ **Public feed** of published listings
- ✅ **Reservation system** for tax-season flow

---

## 🛠️ **STEP 0 — Install Dependencies**

Run in your Next.js app:

```bash
npm i @supabase/supabase-js @supabase/ssr
```

---

## 🔧 **STEP 1 — Supabase Project Setup**

### **1.1 Create Supabase Project**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project
3. Copy your **Project URL** and **anon public key** (NOT service role)

### **1.2 Environment Variables**

Create **`.env.local`**:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-URL.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...YOUR-ANON-KEY
```

**Deploy to Vercel:**
- Go to **Vercel → Project → Settings → Environment Variables**
- Add the same two variables there

---

## 🗄️ **STEP 2 — Database Schema + RLS**

**Paste this entire SQL into Supabase SQL Editor and run:**

```sql
-- extensions
create extension if not exists "pgcrypto";

-- tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'user',
  created_at timestamptz default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  vertical text not null default 'auto' check (vertical in ('auto','home')),
  year int,
  make text,
  model text,
  trim text,
  mileage int,
  vin text,
  title_status text default 'clean' check (title_status in ('clean','rebuilt','salvage','other')),
  price_target numeric,
  price_min numeric,
  price_max numeric,
  city text,
  state text,
  photos text[] default '{}',         -- array of storage URLs
  copy_draft text,
  features text[] default '{}',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_by uuid not null default auth.uid(),
  buyer_name text not null,
  buyer_email text not null,
  hold_fee numeric default 0,
  hold_window_days int default 10,
  status text not null default 'created' check (status in ('created','active','settled','canceled','expired')),
  terms_hash text,                    -- on-chain hash later
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- triggers to keep updated_at fresh
create or replace function public.tg_update_timestamp() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_upd_listings on public.listings;
create trigger trg_upd_listings before update on public.listings
for each row execute procedure public.tg_update_timestamp();

drop trigger if exists trg_upd_reservations on public.reservations;
create trigger trg_upd_reservations before update on public.reservations
for each row execute procedure public.tg_update_timestamp();

-- indexes
create index if not exists idx_listings_owner on public.listings(owner_id);
create index if not exists idx_listings_status on public.listings(status);
create index if not exists idx_resv_listing on public.reservations(listing_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.reservations enable row level security;

-- profiles: each user reads/writes their own
create policy "profiles self access" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles self write" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles self update" on public.profiles
  for update using (auth.uid() = id);

-- listings:
-- 1) anyone can read published listings
create policy "listings public read published" on public.listings
  for select using (status = 'published');

-- 2) owners can read their own
create policy "listings owner read" on public.listings
  for select using (auth.uid() = owner_id);

-- 3) create: only signed-in; owner_id must be me
create policy "listings owner create" on public.listings
  for insert with check (auth.uid() = owner_id);

-- 4) update/delete: owner only
create policy "listings owner write" on public.listings
  for update using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
create policy "listings owner delete" on public.listings
  for delete using (auth.uid() = owner_id);

-- reservations:
-- 1) create: signed-in can create (created_by = me)
create policy "resv create" on public.reservations
  for insert with check (auth.uid() = created_by);

-- 2) read: owner of listing OR creator of reservation
create policy "resv read owner or creator" on public.reservations
  for select using (
    auth.uid() = created_by
    or auth.uid() in (
      select l.owner_id from public.listings l where l.id = reservations.listing_id
    )
  );

-- 3) update: only creator or listing owner
create policy "resv update owner or creator" on public.reservations
  for update using (
    auth.uid() = created_by
    or auth.uid() in (select l.owner_id from public.listings l where l.id = reservations.listing_id)
  );

-- STORAGE bucket for listing photos
insert into storage.buckets (id, name, public) values ('listings','listings', true)
on conflict (id) do nothing;

-- storage policies: public read, owners write to their folder `${auth.uid()}/...`
create policy "storage public read" on storage.objects
  for select using ( bucket_id = 'listings' );

create policy "storage user write own folder" on storage.objects
  for insert with check (
    bucket_id = 'listings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage user update own folder" on storage.objects
  for update using (
    bucket_id = 'listings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "storage user delete own folder" on storage.objects
  for delete using (
    bucket_id = 'listings'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

> **Important:** Upload paths must be `listings/${user.id}/filename.jpg` for writes to pass.

---

## 🔌 **STEP 3 — Supabase Client Setup**

### **Server Client**

```typescript
// /lib/supabaseServer.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function supabaseServer() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}
```

### **Browser Client**

```typescript
// /lib/supabaseBrowser.ts
import { createBrowserClient } from "@supabase/ssr";

export const supabaseBrowser = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

---

## 📝 **STEP 4 — TypeScript Types**

```typescript
// /types/db.ts
export type TitleStatus = "clean" | "rebuilt" | "salvage" | "other";
export type Vertical = "auto" | "home";

export interface Listing {
  id: string;
  owner_id: string;
  vertical: Vertical;
  year?: number | null;
  make?: string | null;
  model?: string | null;
  trim?: string | null;
  mileage?: number | null;
  vin?: string | null;
  title_status?: TitleStatus;
  price_target?: number | null;
  price_min?: number | null;
  price_max?: number | null;
  city?: string | null;
  state?: string | null;
  photos: string[];
  copy_draft?: string | null;
  features?: string[] | null;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  listing_id: string;
  created_by: string;
  buyer_name: string;
  buyer_email: string;
  hold_fee?: number | null;
  hold_window_days: number;
  status: "created" | "active" | "settled" | "canceled" | "expired";
  terms_hash?: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## 🔐 **STEP 5 — Authentication (Email Magic Link)**

```tsx
// /app/login/page.tsx
"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  
  async function sendLink() {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithOtp({ 
      email, 
      options: { 
        emailRedirectTo: `${location.origin}/` 
      }
    });
    if (error) alert(error.message);
    else setSent(true);
  }
  
  return (
    <div className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <input 
        className="border p-2 w-full" 
        placeholder="you@email.com"
        value={email} 
        onChange={e=>setEmail(e.target.value)} 
      />
      <button 
        onClick={sendLink} 
        className="bg-black text-white px-4 py-2 rounded"
      >
        Send magic link
      </button>
      {sent && <p>Check your email!</p>}
    </div>
  );
}
```

---

## 📸 **STEP 6 — Create Listing Page (with Photo Upload)**

```tsx
// /app/new-listing/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function NewListing() {
  const supabase = supabaseBrowser();
  const [userId, setUserId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [form, setForm] = useState({
    year: "", make: "", model: "", mileage: "",
    vin: "", title_status: "clean", price_target: "", city: "", state: ""
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || ""));
  }, []);

  const onChange = (e: any) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  async function uploadAll(): Promise<string[]> {
    if (!files || !userId) return [];
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const path = `${userId}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("listings")
        .upload(path, file, { upsert: false });
      if (error) throw error;
      const { data: pub } = supabase.storage
        .from("listings")
        .getPublicUrl(path);
      urls.push(pub.publicUrl);
    }
    return urls;
  }

  async function createListing() {
    try {
      if (!userId) { 
        alert("Please sign in at /login"); 
        return; 
      }
      setSaving(true);
      const photos = await uploadAll();
      const payload = {
        owner_id: userId,
        vertical: "auto",
        year: form.year ? Number(form.year) : null,
        make: form.make || null,
        model: form.model || null,
        mileage: form.mileage ? Number(form.mileage) : null,
        vin: form.vin || null,
        title_status: form.title_status as any,
        price_target: form.price_target ? Number(form.price_target) : null,
        city: form.city || null,
        state: form.state || null,
        photos,
        status: "draft"
      };
      const { data, error } = await supabase
        .from("listings")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      alert(`Listing created: ${data.id}`);
    } catch (e: any) {
      alert(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">New Listing</h1>
      {!userId && (
        <p className="text-sm">
          Not signed in. Go to <a className="underline" href="/login">/login</a>
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <input className="border p-2" placeholder="Year" name="year" onChange={onChange}/>
        <input className="border p-2" placeholder="Make" name="make" onChange={onChange}/>
        <input className="border p-2" placeholder="Model" name="model" onChange={onChange}/>
        <input className="border p-2" placeholder="Mileage" name="mileage" onChange={onChange}/>
        <input className="border p-2" placeholder="VIN" name="vin" onChange={onChange}/>
        <select className="border p-2" name="title_status" defaultValue="clean" onChange={onChange}>
          <option value="clean">Clean</option>
          <option value="rebuilt">Rebuilt</option>
          <option value="salvage">Salvage</option>
          <option value="other">Other</option>
        </select>
        <input className="border p-2" placeholder="Price Target (USD)" name="price_target" onChange={onChange}/>
        <input className="border p-2" placeholder="City" name="city" onChange={onChange}/>
        <input className="border p-2" placeholder="State" name="state" onChange={onChange}/>
      </div>
      <input type="file" multiple onChange={(e)=>setFiles(e.target.files)} />
      <button 
        disabled={saving} 
        onClick={createListing} 
        className="bg-black text-white px-4 py-2 rounded"
      >
        {saving ? "Saving..." : "Create listing"}
      </button>
    </div>
  );
}
```

---

## 🏠 **STEP 7 — Public Feed (Home Page)**

```tsx
// /app/page.tsx
import { supabaseServer } from "@/lib/supabaseServer";

export default async function Home() {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("status","published")
    .order("created_at",{ ascending:false })
    .limit(50);
    
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Latest Listings</h1>
      {!data?.length && <p>No published listings yet.</p>}
      <div className="grid md:grid-cols-3 gap-4">
        {data?.map((l:any)=>(
          <div key={l.id} className="border rounded p-3">
            {l.photos?.[0] && (
              <img 
                src={l.photos[0]} 
                alt="" 
                className="w-full h-40 object-cover rounded" 
              />
            )}
            <div className="mt-2 font-semibold">
              {[l.year,l.make,l.model].filter(Boolean).join(" ")}
            </div>
            <div className="text-sm text-gray-600">
              {l.mileage ? `${l.mileage.toLocaleString()} mi` : ""} 
              {l.city && `• ${l.city}, ${l.state}`}
            </div>
            <div className="mt-1">${l.price_target ?? ""}</div>
          </div>
        ))}
      </div>
      <a 
        href="/new-listing" 
        className="inline-block bg-black text-white px-4 py-2 rounded"
      >
        Create a listing
      </a>
    </main>
  );
}
```

---

## 🔄 **STEP 8 — Publish API (Optional)**

```typescript
// /app/api/listings/publish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  const supabase = supabaseServer();
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  
  const { data: me } = await supabase.auth.getUser();
  if (!me?.user) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  // owner-only update enforced by RLS
  const { data, error } = await supabase
    .from("listings")
    .update({ status: "published" })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ listing: data });
}
```

---

## 📋 **STEP 9 — Reservations API (Optional)**

```typescript
// /app/api/reservations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  const supabase = supabaseServer();
  const body = await req.json();
  const { data: me } = await supabase.auth.getUser();
  if (!me?.user) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  const payload = {
    listing_id: body.listing_id,
    buyer_name: body.buyer_name,
    buyer_email: body.buyer_email,
    hold_fee: body.hold_fee ?? 0,
    hold_window_days: body.hold_window_days ?? 10,
    status: "active"
  };

  const { data, error } = await supabase
    .from("reservations")
    .insert(payload)
    .select()
    .single();
    
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ reservation: data }, { status: 201 });
}
```

---

## 🧪 **STEP 10 — Testing Flow**

### **Test Setup:**
1. **Linux/Mac:** Run `npm run dev`, watch server logs
2. **Windows:** Open `http://localhost:3000/login`
3. **Supabase:** Keep SQL editor and rules open in browser

### **Test Flow:**
1. **Sign in:** Go to `/login` → enter email → check email for magic link
2. **Create listing:** Go to `/new-listing` → fill form → upload 2-3 photos → create (saves as draft)
3. **Publish:** Call `/api/listings/publish` with listing ID (or add publish button)
4. **Verify:** Check `/` to see published listing in feed

### **Quick Publish Test:**
```javascript
// In browser console or Postman
fetch('/api/listings/publish', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 'your-listing-id' })
})
```

---

## ✅ **Deployment Checklist**

- [ ] Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Run SQL schema (tables, RLS, storage bucket + policies)
- [ ] Add `/lib/supabaseServer.ts` and `/lib/supabaseBrowser.ts`
- [ ] Add `/types/db.ts`
- [ ] Create `/app/login/page.tsx`
- [ ] Create `/app/new-listing/page.tsx`
- [ ] Update `/app/page.tsx` (home feed)
- [ ] (Optional) Add `/app/api/listings/publish/route.ts`
- [ ] (Optional) Add `/app/api/reservations/route.ts`
- [ ] Test: `npm run dev` → create listing → publish → verify on `/`
- [ ] **Deploy to Vercel**

---

## 🚀 **Next Steps**

1. **Paste STEP 2 SQL** into Supabase and run it
2. **Follow each step** in order
3. **Test the complete flow** locally
4. **Deploy to Vercel** with environment variables
5. **Integrate with QuickFlip AI agents** for enhanced functionality

---

## 🎯 **Key Benefits of This Setup**

### **vs. Firebase:**
- ✅ **Better performance** with PostgreSQL
- ✅ **More flexible** Row Level Security
- ✅ **Real-time subscriptions** built-in
- ✅ **Better TypeScript support**
- ✅ **Lower costs** for most use cases

### **Production Ready:**
- ✅ **Authentication** with magic links
- ✅ **File storage** with proper security
- ✅ **Database** with RLS policies
- ✅ **API routes** for business logic
- ✅ **Type safety** throughout

---

*Last Updated: [Current Date]*  
*QuickFlip AI - Supabase + Vercel Migration Guide*
