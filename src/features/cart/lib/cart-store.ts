/**
 * Cart lives in localStorage on the client. Server validates the cart at
 * checkout against current product prices/stock — never trust client state.
 */

const STORAGE_KEY = "hk_cart_v1";

export type CartItem = {
  productId: string;
  slug: string;
  categorySlug: string;
  title: string;
  unitPriceCents: number;        // BASE USD cents at the time it was added
  quantity: number;
  coverUrl: string | null;
};

export type CartState = { items: CartItem[] };

function emptyCart(): CartState {
  return { items: [] };
}

export function loadCart(): CartState {
  if (typeof window === "undefined") return emptyCart();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyCart();
    const parsed = JSON.parse(raw) as CartState;
    if (!parsed?.items || !Array.isArray(parsed.items)) return emptyCart();
    return parsed;
  } catch {
    return emptyCart();
  }
}

export function saveCart(cart: CartState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  // Let other tabs / components know.
  window.dispatchEvent(new CustomEvent("hk-cart-changed", { detail: cart }));
}

export function cartItemCount(cart: CartState): number {
  return cart.items.reduce((n, i) => n + i.quantity, 0);
}

export function cartSubtotalCents(cart: CartState): number {
  return cart.items.reduce((n, i) => n + i.unitPriceCents * i.quantity, 0);
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1): CartState {
  const cart = loadCart();
  const existing = cart.items.find((i) => i.productId === item.productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ ...item, quantity });
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(productId: string): CartState {
  const cart = loadCart();
  cart.items = cart.items.filter((i) => i.productId !== productId);
  saveCart(cart);
  return cart;
}

export function setQuantity(productId: string, quantity: number): CartState {
  const cart = loadCart();
  const item = cart.items.find((i) => i.productId === productId);
  if (!item) return cart;
  if (quantity <= 0) return removeFromCart(productId);
  item.quantity = quantity;
  saveCart(cart);
  return cart;
}

export function clearCart(): CartState {
  saveCart({ items: [] });
  return emptyCart();
}
