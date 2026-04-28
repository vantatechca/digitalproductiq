"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Boxes } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-background">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 grid place-items-center text-zinc-900">
              <Boxes className="size-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">DigitalProductIQ</div>
              <div className="text-[10px] uppercase text-muted-foreground">Sign in</div>
            </div>
          </div>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@founder.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <Button className="w-full bg-emerald-500 text-zinc-950 hover:bg-emerald-600" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center">No account? <Link href="/register" className="text-emerald-300 hover:underline">Create one</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
