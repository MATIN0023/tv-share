import { GoogleAuthProvider } from "@/providers/google-auth-provider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleAuthProvider>
      <div className="min-h-screen bg-zinc-950">{children}</div>
    </GoogleAuthProvider>
  );
}
