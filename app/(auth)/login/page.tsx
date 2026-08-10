import { LoginForm } from "@/features/auth/login-form";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    role?: "artesana" | "facilitadora";
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl, role } = await searchParams;

  return <LoginForm callbackUrl={callbackUrl} initialRole={role} />;
}
