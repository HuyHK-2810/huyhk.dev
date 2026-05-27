"use client";

import { useEffect } from "react";
import { clearCart } from "../lib/cart-store";

/** Drops the localStorage cart once the buyer lands on the success page. */
export default function ClearCartOnLoad() {
  useEffect(() => {
    clearCart();
  }, []);
  return null;
}
