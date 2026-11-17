/** Shop rules shared by the storefront, checkout and admin. Data itself lives in Lovable Cloud. */

export type DepartmentId = "women" | "accessories" | "men" | "kids" | "family" | (string & {});

export interface Department {
  id: DepartmentId;
  label: string;
  /** Departments stay disabled until the store has products for them. */
  enabled: boolean;
  sort_order?: number;
}

export interface Product {
  id: string;
  name: string;
  department: DepartmentId;
  fabric: string;
  origin: string;
  price: number;
  tag: string;
  /** Static photo shipped with the site (sample products). */
  image_url: string | null;
  /** Uploaded photo in the product-photos store. Wins over image_url. */
  image_path: string | null;
  is_new_arrival: boolean;
  is_active?: boolean;
  created_at?: string;
}

export type Filter = "all" | "new" | DepartmentId;

export function isDepartmentEnabled(id: DepartmentId, departments: Department[]) {
  return departments.find((d) => d.id === id)?.enabled ?? false;
}

/** Products shown in the shop: only active ones from enabled departments, matching filter and search. */
export function visibleProducts(products: Product[], departments: Department[], filter: Filter = "all", query = "") {
  const q = query.trim().toLowerCase();
  return products.filter((p) => {
    if (p.is_active === false) return false;
    if (!isDepartmentEnabled(p.department, departments)) return false;
    if (filter === "new" && !p.is_new_arrival) return false;
    if (filter !== "all" && filter !== "new" && p.department !== filter) return false;
    if (!q) return true;
    return [p.name, p.fabric, p.origin].some((v) => v.toLowerCase().includes(q));
  });
}

export interface OrderLineInput {
  productId: string;
  qty: number;
}

export interface OrderLine {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

/**
 * Builds order lines from the shop's own prices (never the shopper's). Unknown, hidden or
 * closed-department products are refused; quantities must be whole numbers from 1 to 20.
 */
export function priceOrder(lines: OrderLineInput[], products: Product[], departments: Department[]) {
  if (!lines.length) throw new Error("Your bag is empty.");
  const sellable = visibleProducts(products, departments);
  const out: OrderLine[] = lines.map((l) => {
    const p = sellable.find((x) => x.id === l.productId);
    if (!p) throw new Error("One of the items in your bag is no longer available.");
    if (!Number.isInteger(l.qty) || l.qty < 1 || l.qty > 20) throw new Error("Invalid quantity.");
    return { productId: p.id, name: p.name, price: Number(p.price), qty: l.qty };
  });
  const total = out.reduce((n, l) => n + l.price * l.qty, 0);
  return { lines: out, total };
}

export const ORDER_STATUSES = [
  { id: "awaiting_payment", label: "Awaiting payment" },
  { id: "paid", label: "Paid" },
  { id: "processing", label: "Processing" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number]["id"];

export const statusLabel = (s: string) => ORDER_STATUSES.find((x) => x.id === s)?.label ?? s;

export const formatRand = (n: number) => "R" + Number(n).toLocaleString("en-ZA");
