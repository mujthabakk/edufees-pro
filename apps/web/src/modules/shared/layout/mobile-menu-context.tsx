"use client";
import { createContext, useContext, useState } from "react";

type Ctx = { open: boolean; setOpen: (v: boolean) => void };
const MobileMenuCtx = createContext<Ctx>({ open: false, setOpen: () => {} });

export function MobileMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <MobileMenuCtx.Provider value={{ open, setOpen }}>{children}</MobileMenuCtx.Provider>;
}

export const useMobileMenu = () => useContext(MobileMenuCtx);
