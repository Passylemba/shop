import { describe, expect, it } from "vitest";
import { departments, isDepartmentEnabled, visibleProducts, type Product } from "./catalog";

describe("departments", () => {
  it("only Women and Accessories are open for now", () => {
    expect(departments.filter((d) => d.enabled).map((d) => d.id)).toEqual(["women", "accessories"]);
  });

  it("Men and Kids stay closed until products arrive", () => {
    expect(isDepartmentEnabled("men")).toBe(false);
    expect(isDepartmentEnabled("kids")).toBe(false);
  });

  it("hides products from closed departments even if they exist", () => {
    const list: Product[] = [
      { id: "m", name: "Men's Shirt", department: "men", fabric: "Ankara", origin: "South Africa", price: 1, tag: "", image: "" },
      { id: "w", name: "Wrap Dress", department: "women", fabric: "Ankara", origin: "South Africa", price: 1, tag: "", image: "" },
    ];
    expect(visibleProducts("all", "", list).map((p) => p.id)).toEqual(["w"]);
  });
});
