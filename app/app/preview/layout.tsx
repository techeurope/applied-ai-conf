import type { ReactNode } from "react";
import { VariationSwitcher } from "./_components/VariationSwitcher";

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <VariationSwitcher />
    </>
  );
}
