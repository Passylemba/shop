import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/catalog";

export const PHOTO_BUCKET = "product-photos";

/** Returns product id -> displayable photo URL. Uploaded photos get a temporary viewing link. */
export function useProductImages(products: Pick<Product, "id" | "image_url" | "image_path">[]) {
  const paths = products.map((p) => p.image_path).filter((x): x is string => !!x).sort();
  const signed = useQuery({
    queryKey: ["product-photo-links", paths],
    enabled: paths.length > 0,
    staleTime: 1000 * 60 * 50,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(paths, 60 * 60 * 24);
      if (error) throw error;
      return Object.fromEntries((data ?? []).map((d) => [d.path, d.signedUrl]));
    },
  });
  const map: Record<string, string | undefined> = {};
  for (const p of products) {
    map[p.id] = p.image_path ? signed.data?.[p.image_path] : (p.image_url ?? undefined);
  }
  return map;
}
