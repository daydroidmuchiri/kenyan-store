// src/components/print/DesignStudioWrapper.tsx
"use client";

import { useRouter } from "next/navigation";
import { DesignStudio } from "./DesignStudio";
import type { PrintableProductData } from "@/types/print";

interface Props {
  product: PrintableProductData;
}

export function DesignStudioWrapper({ product }: Props) {
  const router = useRouter();

  return (
    <DesignStudio
      product={product}
      onClose={() => router.push("/custom-print")}
    />
  );
}
