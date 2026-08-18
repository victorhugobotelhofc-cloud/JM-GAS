"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Pedido = {
  id: number;
  nome: string;
  whatsapp: string;
  email: string | null;
  endereco: string;

  gas: number | string | null;
  agua: number | string | null;

  observacao: string | null;
  status: string;
  criado_em: string;
};

export default function PainelJM() {
  const router = useRouter();

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState<number | null>(null);
  const [verificandoLogin, setVerificandoLogin] = useState(true);

  // =========================
  // VERIFICAR LOGIN
  // =========================

  useEffect(() => {
    let cancelado = false;

    async function verificarLogin() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (cancelado) return;

      if (error || !user) {
        router.replace("/login?next=/jm");
        return;
      }

      setVerificandoLogin(false);
    }

    verificarLogin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.replace("/login?next=/jm");
        }
      }
    );

    return () => {
      cancelado = true;
      subscription.unsubscribe();
    };
  }, [router]);

  // =========================
  // CARREGAR PEDIDOS
  // =========================

  useEffect(() => {
    if (verificandoLogin) return;

    async function carregarPedidos() {
      setCarregando(true);

      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .order("criado_em", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Erro ao carregar pedidos:",
          error
        );

        setCarregando(false);
        return;
      }

      setPedidos((data || []) as Pedido[]);
      setCarregando(false);
    }

    carregarPedidos();
  }, [verificandoLogin]);

  // =========================
  // ALTERAR STATUS
  // =========================

  async function alterarStatus(
    id: number,
    novoStatus: "aceito" | "cancelado"
  ) {
    setAtualizando(id);

    const { error } = await supabase
      .from("pedidos")
      .update({
        status: novoStatus,
      })
      .eq("id", id);

    if (error) {
      console.error(
        "Erro ao alterar status:",
        error
      );

      alert(
        `Erro ao alterar status: ${error.message}`
      );

      setAtualizando(null);
      return;
    }

    setPedidos((atuais) =>
      atuais.map((pedido) =>
        pedido.id === id
          ? {
              ...pedido,
              status: novoStatus,
            }
          : pedido
      )
    );

    setAtualizando(null);
  }

  // =========================
  // APAGAR DEFINITIVAMENTE
  // =========================

  async function apagarPedido(id: number) {
    const confirmar = window.confirm(
      "Tem certeza que deseja APAGAR este pedido definitivamente?\n\nEssa ação não pode ser desfeita."
    );

    if (!confirmar) return;

    setAtualizando(id);

    const { error } = await supabase
      .from("pedidos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "Erro ao apagar pedido:",
        error
      );

      alert(
        `Não foi possível apagar o pedido: ${error.message}`
      );

      setAtualizando(null);
      return;
    }

    setPedidos((atuais) =>
      atuais.filter(
        (pedido) => pedido.id !== id
      )
    );

    setAtualizando(null);
  }

  // =========================
  // SAIR
  // =========================

  async function sair() {
    await supabase.auth.signOut();

    router.replace("/login?next=/jm");
  }

  // =========================
  // STATUS
  // =========================

  function statusCor(status: string) {
    switch (status) {
      case "novo":
        return "bg-red-100 text-red-700 border-red-200";

      case "aceito":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";

      case "cancelado":
        return "bg-zinc-200 text-zinc-700 border-zinc-300";

      case "em_entrega":
        return "bg-blue-100 text-blue-700 border-blue-200";

      case "entregue":
        return "bg-green-100 text-green-700 border-green-200";

      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  }

  function statusNome(status: string) {
    switch (status) {
      case "novo":
        return "NOVO";

      case "aceito":
        return "ACEITO";

      case "cancelado":
        return "CANCELADO";

      case "em_entrega":
        return "EM ENTREGA";

      case "entregue":
        return "ENTREGUE";

      default:
        return status.toUpperCase();
    }
  }

  // =========================
  // VERIFICANDO LOGIN
  // =========================

  if (verificandoLogin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-2xl">
          <div className="text-4xl">
            🔐
          </div>

          <p className="mt-3 font-black text-zinc-900">
            Verificando acesso...
          </p>
        </div>
      </main>
    );
  }

  // =========================
  // PAINEL
  // =========================

  return (
    <main className="min-h-screen bg-zinc-100">

      {/* CABEÇALHO */}

      <header className="border-b border-red-900/30 bg-red-700 text-white shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">

          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-100">
              JM GÁS
            </p>

            <h1 className="mt-1 text-3xl font-black">
              PAINEL
            </h1>

            <p className="mt-1 text-sm text-red-100">
              Gerenciamento de pedidos
            </p>
          </div>

          <button
            type="button"
            onClick={sair}
            className="rounded-xl bg-white/15 px-4 py-2 text-sm font-black text-white transition hover:bg-white/25"
          >
            Sair
          </button>

        </div>
      </header>

      {/* CONTEÚDO */}

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

        <div className="mb-6 flex items-end justify-between">

          <div>
            <h2 className="text-2xl font-black text-zinc-900">
              Pedidos
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {pedidos.length} pedido(s)
            </p>
          </div>

          <div className="hidden rounded-2xl bg-red-50 px-4 py-3 text-right sm:block">
            <p className="text-xs font-bold uppercase text-red-500">
              Sistema
            </p>

            <p className="text-sm font-black text-red-700">
              Online
            </p>
          </div>

        </div>

        {/* CARREGANDO */}

        {carregando && (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-zinc-200">
            <div className="text-4xl">
              🔥
            </div>

            <p className="mt-3 font-black text-zinc-900">
              Carregando pedidos...
            </p>
          </div>
        )}

        {/* NENHUM PEDIDO */}

        {!carregando &&
          pedidos.length === 0 && (
            <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-zinc-200">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
                📦
              </div>

              <p className="mt-4 text-xl font-black text-zinc-900">
                Nenhum pedido encontrado
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Os novos pedidos aparecerão aqui.
              </p>

            </div>
          )}

        {/* PEDIDOS */}

        {!carregando &&
          pedidos.length > 0 && (
            <div className="grid gap-5">

              {pedidos.map((pedido) => {
                const gas = Number(pedido.gas) || 0;
                const agua = Number(pedido.agua) || 0;

                const bloqueado =
                  atualizando === pedido.id;

                return (
                  <div
                    key={pedido.id}
                    className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200"
                  >

                    {/* BARRA SUPERIOR */}

                    <div className="flex flex-col gap-3 border-b border-zinc-100 bg-zinc-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
                          Pedido #{pedido.id}
                        </p>

                        <h3 className="mt-1 text-2xl font-black text-zinc-900">
                          {pedido.nome}
                        </h3>
                      </div>

                      <span
                        className={`w-fit rounded-full border px-3 py-1.5 text-xs font-black ${statusCor(
                          pedido.status
                        )}`}
                      >
                        {statusNome(
                          pedido.status
                        )}
                      </span>

                    </div>

                    {/* CORPO */}

                    <div className="p-5">

                      {/* CLIENTE + ENTREGA */}

                      <div className="grid gap-4 md:grid-cols-2">

                        <div className="rounded-2xl border border-zinc-200 p-4">

                          <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
                            Cliente
                          </p>

                          <div className="mt-3 space-y-2 text-sm">

                            <p className="font-bold text-zinc-900">
                              👤 {pedido.nome}
                            </p>

                            <p className="text-zinc-600">
                              📱 {pedido.whatsapp}
                            </p>

                            {pedido.email && (
                              <p className="text-zinc-600">
                                ✉️ {pedido.email}
                              </p>
                            )}

                          </div>

                        </div>

                        <div className="rounded-2xl border border-zinc-200 p-4">

                          <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
                            Entrega
                          </p>

                          <p className="mt-3 text-sm leading-6 text-zinc-700">
                            📍 {pedido.endereco}
                          </p>

                        </div>

                      </div>

                      {/* PRODUTOS */}

                      <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">

                        <p className="text-xs font-black uppercase tracking-wider text-red-500">
                          Produtos
                        </p>

                        <div className="mt-3 flex flex-wrap gap-3">

                          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-red-100">

                            <p className="text-xs font-bold text-zinc-500">
                              🧯 Botijão
                            </p>

                            <p className="mt-1 text-2xl font-black text-zinc-900">
                              {gas}x
                            </p>

                          </div>

                          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-blue-100">

                            <p className="text-xs font-bold text-zinc-500">
                              💧 Água
                            </p>

                            <p className="mt-1 text-2xl font-black text-zinc-900">
                              {agua}x
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* OBSERVAÇÃO */}

                      {pedido.observacao && (
                        <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">

                          <p className="text-xs font-black uppercase tracking-wider text-yellow-600">
                            Observação
                          </p>

                          <p className="mt-2 text-sm text-zinc-700">
                            {pedido.observacao}
                          </p>

                        </div>
                      )}

                      {/* AÇÕES */}

                      <div className="mt-5 flex flex-wrap gap-3 border-t border-zinc-100 pt-5">

                        {/* ACEITAR */}

                        <button
                          type="button"
                          disabled={bloqueado}
                          onClick={() =>
                            alterarStatus(
                              pedido.id,
                              "aceito"
                            )
                          }
                          className="rounded-2xl bg-red-600 px-5 py-3 font-black text-white transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {atualizando ===
                          pedido.id
                            ? "ATUALIZANDO..."
                            : "✅ ACEITAR"}
                        </button>

                        {/* CANCELAR */}

                        <button
                          type="button"
                          disabled={bloqueado}
                          onClick={() =>
                            alterarStatus(
                              pedido.id,
                              "cancelado"
                            )
                          }
                          className="rounded-2xl bg-zinc-100 px-5 py-3 font-black text-zinc-700 transition hover:bg-zinc-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          ❌ CANCELAR
                        </button>

                        {/* APAGAR */}

                        <button
                          type="button"
                          disabled={bloqueado}
                          onClick={() =>
                            apagarPedido(
                              pedido.id
                            )
                          }
                          className="rounded-2xl border border-red-200 bg-white px-5 py-3 font-black text-red-600 transition hover:bg-red-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          🗑️ APAGAR
                        </button>

                      </div>

                    </div>
                  </div>
                );
              })}

            </div>
          )}

      </div>
    </main>
  );
}
