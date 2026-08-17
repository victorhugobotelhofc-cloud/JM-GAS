"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const EMAIL_AUTORIZADO = "jmgashugo747@gmail.com";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

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

    try {
      const login = supabase.auth.signInWithPassword({
        email: emailDigitado,
        password: senha,
      });

      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              "A conexão com o Supabase demorou demais. Verifique as variáveis do Supabase e tente novamente."
            )
          );
        }, 10000);
      });

      const { data, error } = await Promise.race([
        login,
        timeout,
      ]);

      if (error) {
        console.error("Erro no login:", error);
        setErro(error.message);
        return;
      }

      if (!data?.session) {
        setErro("O login não criou uma sessão.");
        return;
      }

      router.replace("/point");
    } catch (error) {
      console.error("Erro no login:", error);

      if (error instanceof Error) {
        setErro(error.message);
      } else {
        setErro("Não foi possível fazer login.");
      }
    } finally {
      setEntrando(false);
    }
  }

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
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none focus:border-zinc-950 focus:bg-white"
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
              onChange={(e) =>
                setSenha(e.target.value)
              }
              placeholder="Digite sua senha"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none focus:border-zinc-950 focus:bg-white"
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
            className="w-full rounded-2xl bg-zinc-950 px-6 py-4 font-black text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {entrando
              ? "ENTRANDO..."
              : "ENTRAR"}
          </button>
        </form>
      </div>
    </main>
  );
}
