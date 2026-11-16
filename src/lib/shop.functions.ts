import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database, Json } from "@/integrations/supabase/types";
import { priceOrder, type Department, type Product } from "@/lib/catalog";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function loadCatalog() {
  const sb = publicClient();
  const [d, p] = await Promise.all([
    sb.from("departments").select("id, label, enabled, sort_order").order("sort_order"),
    sb
      .from("products")
      .select("id, name, department, fabric, origin, price, tag, image_url, image_path, is_new_arrival, is_active, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
  ]);
  if (d.error) throw new Error(d.error.message);
  if (p.error) throw new Error(p.error.message);
  return {
    departments: d.data as Department[],
    products: (p.data ?? []).map((x) => ({ ...x, price: Number(x.price) })) as Product[],
  };
}

export const getStorefront = createServerFn({ method: "GET" }).handler(() => loadCatalog());

const orderSchema = z.object({
  customer_name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z.string().trim().min(7, "Please enter a phone number").max(20),
  email: z.string().trim().email("Please enter a valid email").max(255).optional().or(z.literal("")),
  address: z.string().trim().min(5, "Please enter a delivery address").max(500),
  notes: z.string().trim().max(500).optional(),
  lines: z
    .array(z.object({ productId: z.string().uuid(), qty: z.number().int().min(1).max(20) }))
    .min(1)
    .max(50),
});

/** Public: shoppers place an order now and pay once the payment system is connected. */
export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input: z.input<typeof orderSchema>) => orderSchema.parse(input))
  .handler(async ({ data }) => {
    const { products, departments } = await loadCatalog();
    const { lines, total } = priceOrder(data.lines, products, departments);
    // Shoppers cannot read or write orders directly; the order is written here after pricing.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.customer_name,
        phone: data.phone,
        email: data.email || null,
        address: data.address,
        notes: data.notes || null,
        items: lines as unknown as Json,
        total,
      })
      .select("order_number")
      .single();
    if (error) throw new Error("We couldn't save your order. Please try again.");
    return { orderNumber: row.order_number, total };
  });
