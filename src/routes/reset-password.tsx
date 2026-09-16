import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Redefinir senha — NoivaHub" },
      { name: "description", content: "Defina uma nova senha para sua conta NoivaHub." },
      { property: "og:title", content: "Redefinir senha — NoivaHub" },
      { property: "og:description", content: "Defina uma nova senha." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha precisa de ao menos 6 caracteres.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Senha atualizada!");
      navigate({ to: "/noiva" });
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-display text-4xl">Nova senha</h1>
        <form onSubmit={submit} className="surface mt-6 space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="pw">Nova senha</Label>
            <Input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            Salvar senha
          </Button>
        </form>
      </main>
    </div>
  );
}
