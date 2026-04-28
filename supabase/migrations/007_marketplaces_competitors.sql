-- Marketplaces & Competitors
create table if not exists marketplaces (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  url text not null,
  primary_categories text[],
  takes_pct numeric,
  is_active boolean default true,
  scrape_frequency_minutes int,
  notes text,
  created_at timestamptz default now()
);

create table if not exists competitors (
  id uuid primary key default uuid_generate_v4(),
  marketplace_id uuid references marketplaces(id),
  name text not null,
  shop_url text,
  external_id text,
  primary_category text,
  niches text[],
  total_products int,
  estimated_monthly_revenue_usd int,
  estimated_total_sales int,
  avg_product_price numeric,
  avg_rating numeric,
  follower_count int,
  founded_at date,
  is_top_seller boolean default false,
  notes text,
  last_scraped_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_competitors_marketplace_id on competitors(marketplace_id);
create index if not exists idx_competitors_primary_category on competitors(primary_category);
create index if not exists idx_competitors_is_top_seller on competitors(is_top_seller);

create table if not exists competitor_products (
  id uuid primary key default uuid_generate_v4(),
  competitor_id uuid references competitors(id) on delete cascade,
  marketplace_id uuid references marketplaces(id),
  title text not null,
  description text,
  price_usd numeric,
  format text,
  external_url text,
  external_id text,
  thumbnail_url text,
  rating numeric,
  review_count int,
  estimated_monthly_sales int,
  estimated_monthly_revenue_usd int,
  tags text[],
  collected_at timestamptz default now()
);

create index if not exists idx_competitor_products_competitor_id on competitor_products(competitor_id);
create index if not exists idx_competitor_products_marketplace_id on competitor_products(marketplace_id);
