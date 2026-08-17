"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const EMAIL_AUTORIZADO = "admin@jmgas.local";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  async function entrar(e: FormEvent) {
    e.preventDefault();

    setErro("");

    if (email.trim().toLowerCase() !== EMAIL_AUTORIZADO) {
      setErro("E-mail ou senha incorretos.");
      return;
    }

    setEntrando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    if (error) {
      console.error(error);
      setErro("E-mail ou senha incorretos.");
      setEntrando(false);
      return;
    }

    router.push("/point");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl ring-1 ring-zinc-200">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-black text-zinc-950">
            Área Restrita
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Entre para acessar o sistema.
          </p>
        </div>

        <form onSubmit={entrar} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-700">
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              autoComplete="username"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none focus:border-zinc-950 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-700">
              Senha
            </label>

            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none focus:border-zinc-950 focus:bg-white"
              required
            />
          </div>

          {erro && (
            <div className="rounded-2xl bg-red-50 p-4 text-center text-sm font-bold text-red-600">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={entrando}
            className="w-full rounded-2xl bg-zinc-950 px-6 py-4 font-black text-white transition hover:brightness-90 disabled:opacity-60"
          >
            {entrando ? "ENTRANDO..." : "ENTRAR"}
          </button>
        </form>
      </div>
    </main>
  );
}
