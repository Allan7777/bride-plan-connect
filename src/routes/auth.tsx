import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/noivahub";

const searchSchema = z.object({
  modo: z.enum(["login", "cadastro"]).catch("login"),
  perfil: z.enum(["noiva", "fornecedor"]).catch("noiva"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — NoivaHub" },
      {
        name: "description",
        content: "Acesse sua conta de noiva ou fornecedor no NoivaHub.",
      },
      { property: "og:title", content: "Entrar ou criar conta — NoivaHub" },
      { property: "og:description", content: "Acesse o NoivaHub." },
    ],
  }),
  component: AuthPage,
});

const signupSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(6, "A senha precisa de ao menos 6 caracteres").max(72),
  name: z.string().trim().min(2, "Informe seu nome").max(120),
});

function AuthPage() {
  const { modo, perfil } = Route.useSearch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });

  const isSignup = modo === "cadastro";
  const isVendor = perfil === "fornecedor";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const parsed = signupSchema.safeParse(form);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0]!.message);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: parsed.data.name, type: isVendor ? "vendor" : "bride" },
          },
        });
        if (error) throw error;
        const userId = data.user?.id;
        if (!data.session || !userId) {
          toast.success("Confirme seu e-mail para ativar a conta.");
          return;
        }

        await supabase.from("profiles").insert({
          id: userId,
          email: parsed.data.email,
          full_name: parsed.data.name,
          type: isVendor ? "vendor" : "bride",
          referral_code: `${slugify(parsed.data.name).slice(0, 10).toUpperCase()}${userId.slice(0, 4).toUpperCase()}`,
        });
        await supabase.from("subscriptions").insert({
          user_id: userId,
          plan: isVendor ? "vendor" : "bride",
          status: "none",
        });

        if (isVendor) {
          await supabase.from("vendors").insert({
            user_id: userId,
            company_name: parsed.data.name,
            owner_name: parsed.data.name,
            email: parsed.data.email,
            slug: `${slugify(parsed.data.name)}-${userId.slice(0, 6)}`,
            status: "pendente",
          });
          toast.success("Conta criada! Vamos montar seu perfil.");
          navigate({ to: "/painel/perfil" });
        } else {
          await supabase.from("brides").insert({ id: userId });
          toast.success("Conta criada! Vamos montar seu planejamento.");
          navigate({ to: "/onboarding" });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
        const { data: profile } = await supabase
          .from("profiles")
          .select("type")
          .eq("id", data.user.id)
          .maybeSingle();
        navigate({ to: profile?.type === "vendor" ? "/painel" : "/noiva" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível continuar.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    if (!form.email.trim()) {
      toast.error("Digite seu e-mail para receber o link.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Enviamos um link de redefinição para seu e-mail.");
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-md flex-col px-4 py-14">
        <h1 className="font-display text-4xl">
          {isSignup ? (isVendor ? "Criar conta de fornecedor" : "Criar conta de noiva") : "Entrar"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSignup
            ? isVendor
              ? "Coloque seu negócio na frente de quem está planejando o casamento."
              : "Organize seu casamento e encontre seus fornecedores."
            : "Bem-vinda de volta ao seu planejamento."}
        </p>

        {isSignup ? (
          <div className="mt-6 grid grid-cols-2 gap-2">
            <Button
              asChild
              variant={isVendor ? "outline" : "default"}
              size="sm"
            >
              <Link to="/auth" search={{ modo: "cadastro", perfil: "noiva" }}>
                Sou noiva
              </Link>
            </Button>
            <Button asChild variant={isVendor ? "default" : "outline"} size="sm">
              <Link to="/auth" search={{ modo: "cadastro", perfil: "fornecedor" }}>
                Sou fornecedor
              </Link>
            </Button>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="surface mt-6 space-y-4 p-6">
          {isSignup ? (
            <div className="space-y-2">
              <Label htmlFor="name">{isVendor ? "Nome da empresa" : "Seu nome"}</Label>
              <Input
                id="name"
                value={form.name}
                maxLength={120}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Aguarde..." : isSignup ? "Criar conta" : "Entrar"}
          </Button>
          {!isSignup ? (
            <button
              type="button"
              onClick={handleReset}
              className="w-full text-xs text-muted-foreground underline"
            >
              Esqueci minha senha
            </button>
          ) : null}
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignup ? "Já tem conta?" : "Ainda não tem conta?"}{" "}
          <Link
            to="/auth"
            search={{ modo: isSignup ? "login" : "cadastro", perfil }}
            className="underline"
          >
            {isSignup ? "Entrar" : "Criar conta"}
          </Link>
        </p>
      </main>
    </div>
  );
}
