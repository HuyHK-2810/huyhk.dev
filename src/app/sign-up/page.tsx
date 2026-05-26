import { redirect } from "next/navigation";
import Nav from "@/components/brand/nav";
import Footer from "@/components/brand/footer";
import SignUpForm from "@/features/auth/components/sign-up-form";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata = {
  title: "Sign up — huyHK",
  robots: { index: false, follow: false },
};

export default async function SignUpPage() {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  return (
    <>
      <Nav />
      <main className="mx-auto flex max-w-[var(--container-wide)] flex-col items-center px-6 pb-24 pt-[112px] md:px-12 md:pt-[120px]">
        <SignUpForm />
      </main>
      <Footer />
    </>
  );
}
