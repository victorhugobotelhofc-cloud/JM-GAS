"use client";

import Image from "next/image";
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
  const [atualizando, setAtualizando] = useState<number | null>(null);
  const [verificandoLogin, setVerificandoLogin] = useState(true);
  const [abrindoRota, setAbrindoRota] = useState<number | null>(null);

  // =========================
  // LOGIN
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/login?next=/point");
      }
    });

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
        console.error("Erro ao carregar pedidos:", error);
        setCarregando(false);
        return;
      }

      setPedidos((data ?? []) as Pedido[]);
      setCarregando(false);
    }

    carregarPedidos();
  }, [verificandoLogin]);

  // =========================
  // ENTREGAR PEDIDO
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
      console.error("Erro ao atualizar pedido:", error);

      alert(`Não foi possível atualizar o pedido: ${error.message}`);

      setAtualizando(null);
      return;
    }

    setPedidos((atuais) =>
      atuais.filter((pedido) => pedido.id !== id)
    );

    setAtualizando(null);
  }

  // =========================
  // MONTAR ENDEREÇO
  // =========================

  function montarEndereco(pedido: Pedido) {
    const partes = [
      pedido.rua,
      pedido.numero,
      pedido.complemento,
      pedido.bairro,
      pedido.cidade,
      pedido.estado,
      pedido.cep,
      "Brasil",
    ].filter(
      (parte) =>
        parte !== null &&
        parte !== undefined &&
        String(parte).trim() !== ""
    );

    return partes.join(", ");
  }

  // =========================
  // ABRIR GOOGLE MAPS
  // =========================

  function abrirRota(pedido: Pedido) {
    const endereco = montarEndereco(pedido);

    if (!endereco || endereco.trim() === "") {
      alert("O endereço deste pedido está vazio.");
      return;
    }

    setAbrindoRota(pedido.id);

    const destino = encodeURIComponent(endereco.trim());

    /*
     * A janela é aberta imediatamente pelo clique.
     * Isso evita bloqueio de popup enquanto esperamos o GPS.
     */
    const novaAba = window.open(
      "",
      "_blank",
      "noopener,noreferrer"
    );

    if (!novaAba) {
      setAbrindoRota(null);

      alert(
        "O navegador bloqueou a abertura do Google Maps. Permita pop-ups para este site e tente novamente."
      );

      return;
    }

    /*
     * Depois dessa verificação, "aba" é garantidamente
     * uma janela válida para o TypeScript.
     */
    const aba = novaAba;

    /*
     * Tela temporária enquanto o GPS é obtido.
     */
    try {
      aba.document.title = "JM GÁS - Abrindo rota";

      aba.document.body.innerHTML = `
        <div style="
          font-family: Arial, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          padding: 20px;
          background: #f4f4f5;
          color: #18181b;
          text-align: center;
        ">
          <div style="
            width: 90%;
            max-width: 420px;
            padding: 30px;
          ">
            <div style="
              font-size: 48px;
              margin-bottom: 18px;
            ">
              📍
            </div>

            <h2 style="
              margin: 0 0 10px;
              font-size: 24px;
            ">
              Abrindo rota...
            </h2>

            <p style="
              margin: 0;
              color: #71717a;
              line-height: 1.5;
            ">
              Obtendo a localização do entregador.
            </p>
          </div>
        </div>
      `;
    } catch {
      // Continua normalmente caso o navegador impeça
      // acesso ao documento da nova aba.
    }

    // =========================
    // FUNÇÃO PARA ABRIR MAPS
    // =========================

    function abrirMaps(url: string) {
      aba.location.href = url;
      setAbrindoRota(null);
    }

    // =========================
    // SEM GEOLOCALIZAÇÃO
    // =========================

    if (!navigator.geolocation) {
      const url =
        `https://www.google.com/maps/dir/?api=1` +
        `&destination=${destino}` +
        `&travelmode=driving`;

      abrirMaps(url);
      return;
    }

    // =========================
    // PEGAR LOCALIZAÇÃO DO MOTOBOY
    // =========================

    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        const latitude = posicao.coords.latitude;
        const longitude = posicao.coords.longitude;

        /*
         * A localização real do aparelho vira
         * a origem da rota.
         */
        const origem = `${latitude},${longitude}`;

        const url =
          `https://www.google.com/maps/dir/?api=1` +
          `&origin=${encodeURIComponent(origem)}` +
          `&destination=${destino}` +
          `&travelmode=driving`;

        abrirMaps(url);
      },

      (erro) => {
        console.warn(
          "Não foi possível obter a localização do entregador:",
          erro
        );

        /*
         * FALLBACK:
         * abre o Google Maps somente com o destino.
         */
        const url =
          `https://www.google.com/maps/dir/?api=1` +
          `&destination=${destino}` +
          `&travelmode=driving`;

        abrirMaps(url);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }
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
  // QUANTIDADE
  // =========================

  function quantidade(valor: number | string | null) {
    const numero = Number(valor);

    return Number.isFinite(numero) ? numero : 0;
  }

  // =========================
  // TELA DE LOGIN
  // =========================

  if (verificandoLogin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-red-50">
            <Image
              src="/botijao.jpg"
              alt="JM GÁS"
              width={64}
              height={64}
              className="h-full w-full object-contain"
            />
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

  return (
    <main className="min-h-screen bg-zinc-100">
      {/* ========================= */}
      {/* BARRA FIXA */}
      {/* ========================= */}

      <header className="fixed inset-x-0 top-0 z-50 h-[132px] border-b border-red-900/30 bg-red-700 text-white shadow-lg">
        <div className="mx-auto flex h-full max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-white/30">
              <Image
                src="/botijao.jpg"
                alt="JM GÁS"
                width={48}
                height={48}
                className="h-full w-full object-contain"
              />
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

      <div className="mx-auto max-w-4xl px-4 pb-8 pt-[156px] sm:px-6">
        {/* CABEÇALHO */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wider text-red-600">
              Painel do entregador
            </p>

            <h2 className="mt-1 text-3xl font-black tracking-tight text-zinc-950">
              Suas entregas
            </h2>

            <p className="mt-1 max-w-xl text-sm text-zinc-500">
              Confira os dados do cliente, o endereço e os produtos.
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
            <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center overflow-hidden rounded-2xl bg-red-50">
              <Image
                src="/botijao.jpg"
                alt="JM GÁS"
                width={64}
                height={64}
                className="h-full w-full object-contain"
              />
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

        {!carregando && pedidos.length === 0 && (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-zinc-200">
            <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-red-50">
              <Image
                src="/botijao.jpg"
                alt="JM GÁS"
                width={80}
                height={80}
                className="h-full w-full object-contain p-2"
              />
            </div>

            <h3 className="mt-5 text-xl font-black text-zinc-900">
              Tudo tranquilo por aqui
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Não há nenhuma entrega em andamento no momento.
            </p>
          </div>
        )}

        {/* LISTA DE ENTREGAS */}

        {!carregando && pedidos.length > 0 && (
          <div className="space-y-5">
            {pedidos.map((pedido) => {
              const gas = quantidade(pedido.gas);
              const agua = quantidade(pedido.agua);
              const bloqueado = atualizando === pedido.id;
              const rotaAbrindo = abrindoRota === pedido.id;

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
                            href={
                              "https://wa.me/" +
                              pedido.whatsapp.replace(/\D/g, "")
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex text-sm font-bold text-green-600 hover:text-green-700"
                          >
                            📱 {pedido.whatsapp}
                          </a>
                        )}
                      </div>

                      <div className="rounded-2xl bg-blue-50 px-4 py-3 ring-1 ring-blue-100">
                        <p className="text-[10px] font-black uppercase tracking-wider text-blue-500">
                          Status
                        </p>

                        <p className="mt-1 text-sm font-black text-blue-700">
                          EM ENTREGA
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CORPO */}

                  <div className="space-y-5 p-5 sm:p-6">
                    {/* DADOS DO CLIENTE */}

                    <section className="overflow-hidden rounded-2xl border border-zinc-200">
                      <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
                        <p className="text-[11px] font-black uppercase tracking-wider text-zinc-500">
                          Dados do cliente
                        </p>
                      </div>

                      <div className="grid gap-4 p-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-bold uppercase text-zinc-400">
                            Nome
                          </p>

                          <p className="mt-1 text-base font-black text-zinc-900">
                            {pedido.nome}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase text-zinc-400">
                            WhatsApp
                          </p>

                          {pedido.whatsapp ? (
                            <a
                              href={
                                "https://wa.me/" +
                                pedido.whatsapp.replace(/\D/g, "")
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-block text-base font-black text-green-600 hover:text-green-700"
                            >
                              {pedido.whatsapp}
                            </a>
                          ) : (
                            <p className="mt-1 text-base font-black text-zinc-900">
                              Não informado
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* ENDEREÇO */}

                    <section className="overflow-hidden rounded-2xl border border-red-100">
                      <div className="border-b border-red-100 bg-red-50 px-4 py-3">
                        <p className="text-[11px] font-black uppercase tracking-wider text-red-600">
                          Endereço de entrega
                        </p>
                      </div>

                      <div className="p-4">
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-bold uppercase text-zinc-400">
                              Rua e número
                            </p>

                            <p className="mt-1 text-lg font-black text-zinc-950">
                              {pedido.rua}, {pedido.numero}
                            </p>
                          </div>

                          {pedido.complemento && (
                            <div>
                              <p className="text-xs font-bold uppercase text-zinc-400">
                                Complemento
                              </p>

                              <p className="mt-1 text-sm font-semibold text-zinc-700">
                                {pedido.complemento}
                              </p>
                            </div>
                          )}

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-xs font-bold uppercase text-zinc-400">
                                Bairro
                              </p>

                              <p className="mt-1 text-sm font-semibold text-zinc-700">
                                {pedido.bairro}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-bold uppercase text-zinc-400">
                                Cidade
                              </p>

                              <p className="mt-1 text-sm font-semibold text-zinc-700">
                                {pedido.cidade}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-bold uppercase text-zinc-400">
                                Estado
                              </p>

                              <p className="mt-1 text-sm font-semibold text-zinc-700">
                                {pedido.estado}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-bold uppercase text-zinc-400">
                                CEP
                              </p>

                              <p className="mt-1 text-sm font-semibold text-zinc-700">
                                {pedido.cep}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* PRODUTOS */}

                    <section className="overflow-hidden rounded-2xl border border-zinc-200">
                      <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
                        <p className="text-[11px] font-black uppercase tracking-wider text-zinc-500">
                          Produtos
                        </p>
                      </div>

                      <div className="grid gap-3 p-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white">
                              <Image
                                src="/botijao.jpg"
                                alt="Botijão"
                                width={56}
                                height={56}
                                className="h-full w-full object-contain"
                              />
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

                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white">
                              <Image
                                src="/agua.jpg"
                                alt="Água"
                                width={56}
                                height={56}
                                className="h-full w-full object-contain"
                              />
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
                      <section className="overflow-hidden rounded-2xl border border-yellow-200">
                        <div className="border-b border-yellow-200 bg-yellow-50 px-4 py-3">
                          <p className="text-[11px] font-black uppercase tracking-wider text-yellow-600">
                            Observação do cliente
                          </p>
                        </div>

                        <div className="bg-yellow-50/60 p-4">
                          <p className="text-sm leading-6 text-zinc-700">
                            {pedido.observacao}
                          </p>
                        </div>
                      </section>
                    )}

                    {/* AÇÕES */}

                    <section className="border-t border-zinc-100 pt-5">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          disabled={rotaAbrindo}
                          onClick={() => abrirRota(pedido)}
                          className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 font-black text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {rotaAbrindo
                            ? "📍 ABRINDO MAPA..."
                            : "📍 ABRIR ROTA"}
                        </button>

                        <button
                          type="button"
                          disabled={bloqueado}
                          onClick={() => marcarEntregue(pedido.id)}
                          className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 font-black text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {bloqueado
                            ? "ATUALIZANDO..."
                            : "✅ PEDIDO ENTREGUE"}
                        </button>
                      </div>
                    </section>
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
