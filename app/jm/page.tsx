"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type StatusPedido =
  | "novo"
  | "em_entrega"
  | "entregue"
  | "cancelado";

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
  const [atualizando, setAtualizando] =
    useState<number | null>(null);
  const [verificandoLogin, setVerificandoLogin] =
    useState(true);

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
    novoStatus:
      | "em_entrega"
      | "entregue"
      | "cancelado"
  ) {
    const confirmar =
      novoStatus === "cancelado"
        ? window.confirm(
            "Tem certeza que deseja cancelar este pedido?"
          )
        : true;

    if (!confirmar) return;

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
  // APAGAR DE VERDADE
  // =========================

  async function apagarPedido(id: number) {
    const confirmar = window.confirm(
      "APAGAR PEDIDO DEFINITIVAMENTE?\n\nEssa ação remove o pedido do Supabase e não pode ser desfeita."
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
  // QUANTIDADE
  // =========================

  function quantidade(
    valor: number | string | null
  ) {
    const numero = Number(valor);

    return Number.isFinite(numero)
      ? numero
      : 0;
  }

  // =========================
  // STATUS
  // =========================

  function statusCor(status: string) {
    switch (status) {
      case "novo":
        return "bg-red-100 text-red-700 border-red-200";

      case "em_entrega":
        return "bg-blue-100 text-blue-700 border-blue-200";

      case "entregue":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";

      case "cancelado":
        return "bg-zinc-200 text-zinc-700 border-zinc-300";

      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  }

  function statusNome(status: string) {
    switch (status) {
      case "novo":
        return "NOVO";

      case "em_entrega":
        return "EM ENTREGA";

      case "entregue":
        return "ENTREGUE";

      case "cancelado":
        return "CANCELADO";

      default:
        return status.toUpperCase();
    }
  }

  // =========================
  // LOGIN
  // =========================

  if (verificandoLogin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
            🔐
          </div>

          <h1 className="mt-5 text-xl font-black text-zinc-900">
            PAINEL JM
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Verificando acesso...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100">

      {/* CABEÇALHO */}

      <header className="border-b border-red-900/30 bg-red-700 text-white shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl ring-1 ring-white/20">
              📋
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-100">
                JM GÁS
              </p>

              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                PAINEL JM
              </h1>

              <p className="text-xs text-red-100">
                Gerenciamento de pedidos
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={sair}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black text-white ring-1 ring-white/20 transition hover:bg-white/20"
          >
            Sair
          </button>

        </div>
      </header>

      {/* CONTEÚDO */}

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-black uppercase tracking-wider text-red-600">
              Central de pedidos
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
              Pedidos
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Controle as entregas da JM GÁS.
            </p>
          </div>

          <div className="rounded-2xl bg-white px-5 py-4 text-right shadow-sm ring-1 ring-zinc-200">
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Total
            </p>

            <p className="mt-1 text-2xl font-black text-red-600">
              {pedidos.length}
            </p>
          </div>

        </div>

        {/* CARREGANDO */}

        {carregando && (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-zinc-200">

            <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-red-50 text-3xl">
              📦
            </div>

            <p className="mt-4 font-black text-zinc-900">
              Carregando pedidos...
            </p>

          </div>
        )}

        {/* NENHUM PEDIDO */}

        {!carregando &&
          pedidos.length === 0 && (
            <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-zinc-200">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-4xl">
                ✅
              </div>

              <h3 className="mt-5 text-xl font-black text-zinc-900">
                Nenhum pedido
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Quando um cliente fizer um pedido,
                ele aparecerá aqui.
              </p>

            </div>
          )}

        {/* PEDIDOS */}

        {!carregando &&
          pedidos.length > 0 && (
            <div className="space-y-5">

              {pedidos.map((pedido) => {
                const gas = quantidade(pedido.gas);
                const agua = quantidade(pedido.agua);

                const bloqueado =
                  atualizando === pedido.id;

                return (
                  <article
                    key={pedido.id}
                    className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200"
                  >

                    {/* TOPO */}

                    <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-5 sm:px-6">

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
                            Pedido #{pedido.id}
                          </p>

                          <h3 className="mt-1 text-2xl font-black text-zinc-950">
                            {pedido.nome}
                          </h3>

                          <p className="mt-2 text-sm font-semibold text-zinc-500">
                            📱 {pedido.whatsapp}
                          </p>
                        </div>

                        <span
                          className={`w-fit rounded-full border px-4 py-2 text-xs font-black ${statusCor(
                            pedido.status
                          )}`}
                        >
                          {statusNome(
                            pedido.status
                          )}
                        </span>

                      </div>

                    </div>

                    {/* CORPO */}

                    <div className="p-5 sm:p-6">

                      {/* CLIENTE E ENDEREÇO */}

                      <div className="grid gap-4 md:grid-cols-2">

                        <section className="rounded-2xl border border-zinc-200 p-4">

                          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
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

                        </section>

                        <section className="rounded-2xl border border-zinc-200 p-4">

                          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                            Endereço
                          </p>

                          <p className="mt-3 text-sm leading-6 text-zinc-700">
                            📍 {pedido.endereco}
                          </p>

                        </section>

                      </div>

                      {/* PRODUTOS */}

                      <section className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">

                        <p className="text-[10px] font-black uppercase tracking-wider text-red-500">
                          Produtos
                        </p>

                        <div className="mt-3 grid gap-3 sm:grid-cols-2">

                          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-red-100">
                            <div className="flex items-center gap-3">

                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-2xl">
                                🧯
                              </div>

                              <div>
                                <p className="text-xs font-bold text-zinc-500">
                                  Botijão de cozinha
                                </p>

                                <p className="mt-1 text-2xl font-black text-zinc-950">
                                  {gas}x
                                </p>
                              </div>

                            </div>
                          </div>

                          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-blue-100">
                            <div className="flex items-center gap-3">

                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                                💧
                              </div>

                              <div>
                                <p className="text-xs font-bold text-zinc-500">
                                  Água
                                </p>

                                <p className="mt-1 text-2xl font-black text-zinc-950">
                                  {agua}x
                                </p>
                              </div>

                            </div>
                          </div>

                        </div>

                      </section>

                      {/* OBSERVAÇÃO */}

                      {pedido.observacao && (
                        <section className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">

                          <p className="text-[10px] font-black uppercase tracking-wider text-yellow-600">
                            Observação
                          </p>

                          <p className="mt-2 text-sm leading-6 text-zinc-700">
                            {pedido.observacao}
                          </p>

                        </section>
                      )}

                      {/* AÇÕES */}

                      <div className="mt-5 border-t border-zinc-100 pt-5">

                        <p className="mb-3 text-sm font-black text-zinc-900">
                          Ações
                        </p>

                        <div className="flex flex-wrap gap-3">

                          {/* EM ENTREGA */}

                          <button
                            type="button"
                            disabled={bloqueado}
                            onClick={() =>
                              alterarStatus(
                                pedido.id,
                                "em_entrega"
                              )
                            }
                            className="rounded-2xl bg-blue-600 px-5 py-3 font-black text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            🚚 EM ENTREGA
                          </button>

                          {/* ENTREGUE */}

                          <button
                            type="button"
                            disabled={bloqueado}
                            onClick={() =>
                              alterarStatus(
                                pedido.id,
                                "entregue"
                              )
                            }
                            className="rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            ✅ ENTREGUE
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

                  </article>
                );
              })}

            </div>
          )}

      </div>

      <footer className="px-4 pb-6 pt-2 text-center">
        <p className="text-xs font-medium text-zinc-400">
          JM GÁS · Painel administrativo
        </p>
      </footer>

    </main>
  );
}
