import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ShoppingBag, Minus, Plus, Sparkles, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";

import heroImg from "@/assets/hero-ankara.jpg";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { departments, formatRand, products, visibleProducts, type Filter, type Product } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tsholo Couture Demo | African Women's Fashion & Accessories" },
      { name: "description", content: "Shop South African Shweshwe and Ankara dresses, Kente, Mudcloth and handmade African accessories. Wear African. Live African." },
      { property: "og:title", content: "Tsholo Couture Demo | African Women's Fashion" },
      { property: "og:description", content: "South African Ankara & Shweshwe dresses plus African accessories — wear your story." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

type CartLine = Product & { qty: number };

function Shop() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [bagOpen, setBagOpen] = useState(false);

  const list = useMemo(() => visibleProducts(filter, query), [filter, query]);
  const count = cart.reduce((n, l) => n + l.qty, 0);
  const total = cart.reduce((n, l) => n + l.qty * l.price, 0);

  const add = (p: Product) => {
    setCart((c) => {
      const hit = c.find((l) => l.id === p.id);
      return hit ? c.map((l) => (l.id === p.id ? { ...l, qty: l.qty + 1 } : l)) : [...c, { ...p, qty: 1 }];
    });
    toast.success(`${p.name} added to your bag`);
  };
  const change = (id: string, delta: number) =>
    setCart((c) => c.map((l) => (l.id === id ? { ...l, qty: l.qty + delta } : l)).filter((l) => l.qty > 0));

  const pick = (f: Filter) => {
    setFilter(f);
    document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-ink py-2.5 text-center text-gold-soft eyebrow">
        African fashion · Secure checkout coming soon · South Africa
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-4 md:flex-nowrap md:px-10">
          <a href="/" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full border-2 border-gold font-display text-lg font-bold text-gold">TC</span>
            <span>
              <span className="block font-display text-xl font-bold tracking-[0.12em]">TSHOLO COUTURE</span>
              <span className="block text-[0.6rem] tracking-[0.2em] text-muted-foreground">DEMO · WEAR AFRICAN. LIVE AFRICAN.</span>
            </span>
          </a>
          <label className="order-3 flex w-full items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 md:order-none md:ml-auto md:w-80">
            <Search className="size-4 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Ankara, Shweshwe, Kente…"
              aria-label="Search products"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
          <Button variant="bag" size="default" className="ml-auto md:ml-0" onClick={() => setBagOpen(true)}>
            <ShoppingBag /> Bag ({count})
          </Button>
        </div>
        <nav aria-label="Departments" className="bg-ink">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-center gap-2 px-5 py-3">
            {departments.map((d) =>
              d.enabled ? (
                <button
                  key={d.id}
                  onClick={() => pick(d.id)}
                  className="rounded-full border border-gold/40 px-4 py-1.5 text-sm text-ink-foreground transition-colors hover:bg-gold hover:text-gold-foreground"
                >
                  {d.label}
                </button>
              ) : (
                <span
                  key={d.id}
                  aria-disabled="true"
                  className="flex items-center gap-2 rounded-full border border-ink-foreground/15 px-4 py-1.5 text-sm text-ink-foreground/40"
                >
                  {d.label}
                  <span className="rounded-full bg-ink-foreground/10 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider">Soon</span>
                </span>
              ),
            )}
          </div>
        </nav>
      </header>

      <main>
        <section className="relative overflow-hidden bg-ink">
          <img src={heroImg} alt="Woman in a South African Ankara print gown" width={1600} height={1008} className="absolute inset-0 size-full object-cover object-[70%_center]" />
          <div className="absolute inset-0 bg-hero-fade" />
          <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-center px-5 py-20 md:px-10">
            <div className="max-w-xl animate-rise text-ink-foreground">
              <p className="eyebrow text-gold">Celebrating African style</p>
              <h1 className="mt-4 text-5xl font-bold leading-[1.02] md:text-7xl">
                Wear your story.
                <br />
                <em className="text-gold">Live your culture.</em>
              </h1>
              <p className="mt-6 max-w-md leading-relaxed text-ink-foreground/80">
                South African Ankara and Shweshwe pieces, with treasured prints from across the continent — made for the women who wear them proudly.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="gold" size="xl" onClick={() => pick("women")}>Shop women</Button>
                <Button variant="bag" size="xl" className="border-gold/60 bg-transparent text-ink-foreground" onClick={() => pick("accessories")}>
                  Accessories
                </Button>
              </div>
            </div>
          </div>
        </section>
        <div className="kente-rule" />

        <section id="collection" className="mx-auto max-w-7xl scroll-mt-32 px-5 py-16 md:px-10">
          <div className="text-center">
            <p className="eyebrow text-gold">The collection</p>
            <h2 className="mt-2 text-4xl font-bold md:text-5xl">Shop African fashion</h2>
            <p className="mt-3 text-muted-foreground">Women's clothing and accessories · Men & Kids arriving soon</p>
          </div>

          <div className="my-8 flex flex-wrap justify-center gap-2">
            {(["all", ...departments.filter((d) => d.enabled).map((d) => d.id)] as Filter[]).map((f) => (
              <Button key={f} variant="chip" size="sm" className="h-9 rounded-full px-5" data-active={filter === f} onClick={() => setFilter(f)}>
                {f === "all" ? `All (${visibleProducts("all").length})` : departments.find((d) => d.id === f)?.label}
              </Button>
            ))}
          </div>

          {list.length ? (
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
              {list.map((p) => (
                <article key={p.id} className="group flex flex-col overflow-hidden border border-border bg-card transition-shadow hover:shadow-card">
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    <img src={p.image} alt={p.name} width={800} height={1008} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider">
                      {p.tag}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-3 md:p-4">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-gold">
                      {p.fabric} · {p.origin}
                    </p>
                    <h3 className="mt-1 flex-1 text-lg font-semibold leading-snug md:text-xl">{p.name}</h3>
                    <p className="mt-2 font-semibold">{formatRand(p.price)}</p>
                    <Button variant="gold" className="mt-3 w-full" onClick={() => add(p)}>Add to bag</Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-muted-foreground">No pieces match “{query}”.</p>
          )}
        </section>

        <section className="bg-cream">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 text-center sm:grid-cols-3 md:px-10">
            {[
              { icon: Sparkles, t: "Culture-led style", s: "African inspiration, modern expression" },
              { icon: ShieldCheck, t: "Secure payments", s: "Payment gateway connected before launch" },
              { icon: Truck, t: "Delivery options", s: "Shipping across South Africa" },
            ].map(({ icon: Icon, t, s }) => (
              <div key={t}>
                <Icon className="mx-auto size-6 text-gold" />
                <p className="mt-3 font-display text-xl font-semibold">{t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <div className="kente-rule" />
      <footer className="bg-ink py-10 text-center">
        <p className="font-display text-2xl tracking-[0.15em] text-gold">TSHOLO COUTURE DEMO</p>
        <p className="mt-2 text-sm text-ink-foreground/70">Wear African. Live African. Be Proud.</p>
        <p className="mt-4 text-xs text-ink-foreground/40">{products.length} demo pieces · Men & Kids departments coming soon</p>
      </footer>

      <Sheet open={bagOpen} onOpenChange={setBagOpen}>
        <SheetContent className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl">Your bag</SheetTitle>
          </SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto">
            {cart.length === 0 && <p className="py-10 text-center text-muted-foreground">Your bag is empty.</p>}
            {cart.map((l) => (
              <div key={l.id} className="flex gap-3 border-b border-border pb-4">
                <img src={l.image} alt={l.name} className="h-20 w-16 object-cover" />
                <div className="flex-1">
                  <p className="font-display text-lg leading-tight">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{l.fabric}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button variant="outline" size="icon" className="size-7" aria-label="Remove one" onClick={() => change(l.id, -1)}><Minus /></Button>
                    <span className="w-5 text-center text-sm">{l.qty}</span>
                    <Button variant="outline" size="icon" className="size-7" aria-label="Add one" onClick={() => change(l.id, 1)}><Plus /></Button>
                  </div>
                </div>
                <p className="font-semibold">{formatRand(l.price * l.qty)}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex justify-between text-lg font-semibold"><span>Total</span><span>{formatRand(total)}</span></div>
            <Button variant="gold" size="xl" className="w-full" disabled>Checkout coming soon</Button>
            <p className="bg-accent p-3 text-xs text-muted-foreground">Demo only — no orders or payments are processed yet.</p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
