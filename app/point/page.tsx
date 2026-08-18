"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Pedido = {
  id: number;
  nome: string;
  whatsapp: string;

  cep: string;
  rua: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;

  gas: number | string | null;
  agua: number | string | null;

  observacao: string | null;
  status: string;
};

export default function EntregaJM() {
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
        router.replace("/login?next=/point");
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
          router.replace("/login?next=/point");
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
        .eq("status", "em_entrega")
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
  // MARCAR COMO ENTREGUE
  // =========================

  async function marcarEntregue(id: number) {
    setAtualizando(id);

    const { error } = await supabase
      .from("pedidos")
      .update({
        status: "entregue",
      })
      .eq("id", id);

    if (error) {
      console.error(
        "Erro ao atualizar pedido:",
        error
      );

      alert(
        `Não foi possível atualizar o pedido: ${error.message}`
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
  // MONTAR ENDEREÇO
  // =========================

  function montarEndereco(pedido: Pedido) {
    return [
      pedido.rua,
      pedido.numero,
      pedido.complemento,
      pedido.bairro,
      pedido.cidade,
      pedido.estado,
      pedido.cep,
    ]
      .filter(Boolean)
      .join(", ");
  }

  // =========================
  // ABRIR GOOGLE MAPS
  // =========================

  function abrirRota(pedido: Pedido) {
    const endereco = montarEndereco(pedido);
    const destino = encodeURIComponent(endereco);

    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${destino}`,
      "_blank"
    );
  }

  // =========================
  // SAIR
  // =========================

  async function sair() {
    await supabase.auth.signOut();

    router.replace("/login?next=/point");
  }

  // =========================
  // VERIFICANDO LOGIN
  // =========================

  if (verificandoLogin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl">
            🔐
          </div>

          <h1 className="mt-5 text-xl font-black text-zinc-900">
            ENTREGA JM
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Verificando acesso...
          </p>

        </div>
      </main>
    );
  }

  // =========================
  // ENTREGA JM
  // =========================

  return (
    <main className="min-h-screen bg-zinc-100">

      {/* ========================= */}
      {/* BARRA FIXA */}
      {/* ========================= */}

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-red-800/30 bg-red-700 text-white shadow-lg">

        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl shadow-sm ring-1 ring-white/20">
              🛵
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-100">
                JM GÁS
              </p>

              <h1 className="text-2xl font-black tracking-tight">
                ENTREGA JM
              </h1>

              <p className="text-xs text-red-100">
                Entregas em andamento
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={sair}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-black text-white ring-1 ring-white/20 transition hover:bg-white/20 active:scale-[0.98]"
          >
            Sair
          </button>

        </div>

      </header>

      {/* ========================= */}
      {/* CONTEÚDO */}
      {/* ========================= */}

      <div className="mx-auto max-w-4xl px-4 pb-8 pt-32 sm:px-6">

        {/* RESUMO */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-black uppercase tracking-wider text-red-600">
              Painel do entregador
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
              Suas entregas
            </h2>

            <p className="mt-1 max-w-xl text-sm text-zinc-500">
              Confira o endereço, os produtos e abra a rota.
            </p>
          </div>

          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-zinc-200">
            <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
              Em andamento
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
              🛵
            </div>

            <p className="mt-4 font-black text-zinc-900">
              Carregando entregas...
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Buscando pedidos em andamento.
            </p>

          </div>
        )}

        {/* NENHUMA ENTREGA */}

        {!carregando &&
          pedidos.length === 0 && (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-zinc-200">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-4xl">
                ✅
              </div>

              <h3 className="mt-5 text-xl font-black text-zinc-900">
                Tudo tranquilo por aqui
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Não há nenhuma entrega em andamento no momento.
                Quando um pedido for encaminhado para entrega,
                ele aparecerá aqui.
              </p>

            </div>
          )}

        {/* ENTREGAS */}

        {!carregando &&
          pedidos.length > 0 && (
            <div className="space-y-5">

              {pedidos.map((pedido) => {
                const gas =
                  Number(pedido.gas) || 0;

                const agua =
                  Number(pedido.agua) || 0;

                const bloqueado =
                  atualizando === pedido.id;

                return (
                  <article
                    key={pedido.id}
                    className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-200"
                  >

                    {/* CABEÇALHO DO PEDIDO */}

                    <div className="border-b border-zinc-100 bg-zinc-50 px-5 py-5 sm:px-6">

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
                            Pedido #{pedido.id}
                          </p>

                          <h3 className="mt-1 text-2xl font-black text-zinc-950">
                            {pedido.nome}
                          </h3>

                          {pedido.whatsapp && (
                            <a
                              href={`https://wa.me/${pedido.whatsapp.replace(
                                /\D/g,
                                ""
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-green-600 hover:text-green-700"
                            >
                              📱 {pedido.whatsapp}
                            </a>
                          )}
                        </div>

                        <div className="rounded-2xl bg-red-50 px-4 py-3 ring-1 ring-red-100">

                          <p className="text-[10px] font-black uppercase tracking-wider text-red-500">
                            Status
                          </p>

                          <p className="mt-1 text-sm font-black text-red-700">
                            EM ENTREGA
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* CORPO */}

                    <div className="space-y-4 p-5 sm:p-6">

                      {/* ENDEREÇO */}

                      <section className="rounded-2xl border border-zinc-200 bg-white p-4">

                        <div className="flex items-center justify-between gap-3">

                          <div>
                            <p className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                              Endereço de entrega
                            </p>

                            <p className="mt-1 text-lg font-black text-zinc-950">
                              {pedido.rua},{" "}
                              {pedido.numero}
                            </p>
                          </div>

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-lg">
                            📍
                          </div>

                        </div>

                        <div className="mt-3 space-y-1 text-sm">

                          {pedido.complemento && (
                            <p className="font-medium text-zinc-600">
                              {pedido.complemento}
                            </p>
                          )}

                          <p className="text-zinc-600">
                            {pedido.bairro}
                          </p>

                          <p className="text-zinc-600">
                            {pedido.cidade} -{" "}
                            {pedido.estado}
                          </p>

                          <p className="font-semibold text-zinc-500">
                            CEP {pedido.cep}
                          </p>

                        </div>

                      </section>

                      {/* PRODUTOS */}

                      <section className="rounded-2xl border border-red-100 bg-red-50 p-4">

                        <p className="text-[11px] font-black uppercase tracking-wider text-red-500">
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
                        <section className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">

                          <p className="text-[11px] font-black uppercase tracking-wider text-yellow-600">
                            Observação do cliente
                          </p>

                          <p className="mt-2 text-sm leading-6 text-zinc-700">
                            {pedido.observacao}
                          </p>

                        </section>
                      )}

                      {/* BOTÕES */}

                      <div className="grid gap-3 pt-1 sm:grid-cols-2">

                        <button
                          type="button"
                          onClick={() =>
                            abrirRota(pedido)
                          }
                          className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 font-black text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                        >
                          <span className="text-xl">
                            📍
                          </span>

                          ABRIR ROTA
                        </button>

                        <button
                          type="button"
                          disabled={bloqueado}
                          onClick={() =>
                            marcarEntregue(
                              pedido.id
                            )
                          }
                          className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 font-black text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <span className="text-xl">
                            {bloqueado
                              ? "⏳"
                              : "✅"}
                          </span>

                          {bloqueado
                            ? "ATUALIZANDO..."
                            : "PEDIDO ENTREGUE"}
                        </button>

                      </div>

                    </div>
                  </article>
                );
              })}

            </div>
          )}

      </div>

      {/* RODAPÉ */}

      <footer className="px-4 pb-8 pt-2 text-center">
        <p className="text-xs font-medium text-zinc-400">
          ENTREGA JM · Operação JM GÁS
        </p>
      </footer>

    </main>
  );
}
