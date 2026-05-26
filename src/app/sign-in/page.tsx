import { redirect } from "next/navigation";
import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import SignInForm from "@/features/auth/components/sign-in-form";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata = {
  title: "Sign in — huyHK",
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  const { next } = await searchParams;
  if (user) redirect(next ?? "/account");

  return (
    <>
      <Nav />
      <main className="mx-auto flex max-w-[var(--container-wide)] flex-col items-center px-6 pb-24 pt-[112px] md:px-12 md:pt-[120px]">
        <SignInForm redirectTo={next ?? "/account"} />
      </main>
      <Footer />
    </>
  );
}
