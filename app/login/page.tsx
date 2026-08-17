"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const EMAIL_AUTORIZADO = "jmgashugo747@gmail.com";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [verificando, setVerificando] = useState(true);

  // =========================
  // VERIFICAR SESSÃO
  // =========================

  useEffect(() => {
    async function verificarSessao() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace("/point");
        return;
      }

      setVerificando(false);
    }

    verificarSessao();
  }, [router]);

  // =========================
  // LOGIN
  // =========================

  async function fazerLogin(e: FormEvent) {
    e.preventDefault();

    setErro("");

    const emailDigitado = email.trim().toLowerCase();

    if (emailDigitado !== EMAIL_AUTORIZADO) {
      setErro("E-mail ou senha incorretos.");
      return;
    }

    if (!senha) {
      setErro("Digite sua senha.");
      return;
    }

    setEntrando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: emailDigitado,
      password: senha,
    });

    if (error) {
      console.error("Erro no login:", error);

      setErro("E-mail ou senha incorretos.");
      setEntrando(false);

      return;
    }

    router.replace("/point");
  }

  // =========================
  // VERIFICANDO
  // =========================

  if (verificando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
        <div className="text-center">
          <div className="text-4xl">🔐</div>

          <p className="mt-3 font-bold text-zinc-700">
            Verificando acesso...
          </p>
        </div>
      </main>
    );
  }

  // =========================
  // TELA DE LOGIN
  // =========================

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl ring-1 ring-zinc-200">

        <div className="mb-7 text-center">
          <div className="text-5xl">🔐</div>

          <h1 className="mt-3 text-3xl font-black text-zinc-950">
            Área Restrita
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Entre para acessar o POINT JM.
          </p>
        </div>

        <form
          onSubmit={fazerLogin}
          className="space-y-4"
        >

          {/* E-MAIL */}

          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-700">
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Digite seu e-mail"
              autoComplete="username"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-zinc-950 focus:bg-white"
              required
            />
          </div>

          {/* SENHA */}

          <div>
            <label className="mb-2 block text-sm font-bold text-zinc-700">
              Senha
            </label>

            <input
              type="password"
              value={senha}
              onChange={(e) =>
                setSenha(e.target.value)
              }
              placeholder="Digite sua senha"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-zinc-950 focus:bg-white"
              required
            />
          </div>

          {/* ERRO */}

          {erro && (
            <div className="rounded-2xl bg-red-50 p-4 text-center text-sm font-bold text-red-600">
              {erro}
            </div>
          )}

          {/* ENTRAR */}

          <button
            type="submit"
            disabled={entrando}
            className="w-full rounded-2xl bg-zinc-950 px-6 py-4 font-black text-white transition hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {entrando ? "ENTRANDO..." : "ENTRAR"}
          </button>

        </form>
      </div>
    </main>
  );
}
