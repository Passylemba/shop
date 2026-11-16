import { describe, expect, it } from "vitest";
import { isDepartmentEnabled, priceOrder, visibleProducts, type Department, type Product } from "./catalog";

const departments: Department[] = [
  { id: "women", label: "Women", enabled: true },
  { id: "accessories", label: "Accessories", enabled: true },
  { id: "men", label: "Men", enabled: false },
  { id: "kids", label: "Kids", enabled: false },
];

const make = (o: Partial<Product>): Product => ({
  id: "x", name: "Item", department: "women", fabric: "Ankara", origin: "South Africa", price: 100, tag: "",
  image_url: null, image_path: null, is_new_arrival: false, is_active: true, ...o,
});

describe("departments", () => {
  it("Men and Kids stay closed until products arrive", () => {
    expect(isDepartmentEnabled("men", departments)).toBe(false);
    expect(isDepartmentEnabled("kids", departments)).toBe(false);
    expect(isDepartmentEnabled("women", departments)).toBe(true);
  });

  it("hides products from closed departments even if they exist", () => {
    const list = [make({ id: "m", department: "men" }), make({ id: "w" })];
    expect(visibleProducts(list, departments).map((p) => p.id)).toEqual(["w"]);
  });

  it("hides products the owner switched off", () => {
    const list = [make({ id: "a", is_active: false }), make({ id: "b" })];
    expect(visibleProducts(list, departments).map((p) => p.id)).toEqual(["b"]);
  });

  it("New arrivals filter only shows products marked as new", () => {
    const list = [make({ id: "a", is_new_arrival: true }), make({ id: "b" })];
    expect(visibleProducts(list, departments, "new").map((p) => p.id)).toEqual(["a"]);
  });
});

describe("orders", () => {
  const list = [make({ id: "dress", price: 899 }), make({ id: "shirt", department: "men", price: 500 })];

  it("totals use the shop's prices", () => {
    expect(priceOrder([{ productId: "dress", qty: 2 }], list, departments).total).toBe(1798);
  });

  it("refuses products from closed departments", () => {
    expect(() => priceOrder([{ productId: "shirt", qty: 1 }], list, departments)).toThrow();
  });

  it("refuses an empty bag", () => {
    expect(() => priceOrder([], list, departments)).toThrow();
  });
});
