import type { PaymentProvider, PaymentProviderId } from "./types";
import { stripeProvider } from "./stripe";
import { wiseProvider } from "./wise";
import { vnpayProvider } from "./vnpay";
import { momoProvider } from "./momo";

export const allProviders: PaymentProvider[] = [
  stripeProvider,
  vnpayProvider,
  momoProvider,
  wiseProvider,
];

export function getProvider(id: PaymentProviderId): PaymentProvider | null {
  return allProviders.find((p) => p.id === id) ?? null;
}

/** Providers that are env-configured + accept the given display currency. */
export function listAvailableProviders(displayCurrency: string): PaymentProvider[] {
  return allProviders.filter((p) => {
    if (!p.isConfigured()) return false;
    if (p.supportedCurrencies && p.supportedCurrencies.length > 0) {
      return p.supportedCurrencies.includes(displayCurrency);
    }
    return true;
  });
}

export type { PaymentProvider, PaymentProviderId };
export type { CartLine, CheckoutContext, WebhookEvent } from "./types";
