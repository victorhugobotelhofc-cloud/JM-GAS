"use client";

import { useEffect } from "react";
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

  gas: number;
  agua: number;
  observacao: string | null;
  status: string;
};

export default function PointJM() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState<number | null>(null);

  async function carregarPedidos() {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .eq("status", "em_entrega")
      .order("criado_em", { ascending: false });

    if (error) {
      console.error(error);
      setCarregando(false);
      return;
    }

    setPedidos(data || []);
    setCarregando(false);
  }

  async function marcarEntregue(id: number) {
    setAtualizando(id);

    const { error } = await supabase
      .from("pedidos")
      .update({ status: "entregue" })
      .eq("id", id);

    if (error) {
      console.error(error);
      setAtualizando(null);
      return;
    }

    setPedidos((atuais) =>
      atuais.filter((pedido) => pedido.id !== id)
    );

    setAtualizando(null);
  }

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

  function abrirRota(pedido: Pedido) {
    const endereco = montarEndereco(pedido);

    const destino = encodeURIComponent(endereco);

    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${destino}`,
      "_blank"
    );
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-100 p-4 sm:p-6">

      <div className="mx-auto max-w-2xl">

        {/* ========================= */}
        {/* CABEÇALHO */}
        {/* ========================= */}

        <div className="mb-6">

          <h1 className="text-3xl font-black text-zinc-900">
            POINT JM
          </h1>

          <p className="mt-1 text-zinc-500">
            Entregas em andamento
          </p>

        </div>

        {/* ========================= */}
        {/* CARREGANDO */}
        {/* ========================= */}

        {carregando && (
          <div className="rounded-3xl bg-white p-6 shadow">
            Carregando entregas...
          </div>
        )}

        {/* ========================= */}
        {/* NENHUMA ENTREGA */}
        {/* ========================= */}

        {!carregando && pedidos.length === 0 && (
          <div className="rounded-3xl bg-white p-8 text-center shadow">

            <div className="text-4xl">
              🛵
            </div>

            <p className="mt-3 font-bold text-zinc-900">
              Nenhuma entrega agora
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Quando um pedido for enviado para entrega,
              ele aparecerá aqui.
            </p>

          </div>
        )}

        {/* ========================= */}
        {/* ENTREGAS */}
        {/* ========================= */}

        <div className="space-y-5">

          {pedidos.map((pedido) => {

            const enderecoCompleto =
              montarEndereco(pedido);

            return (
              <div
                key={pedido.id}
                className="rounded-3xl bg-white p-6 shadow"
              >

                {/* ========================= */}
                {/* PEDIDO */}
                {/* ========================= */}

                <div>

                  <p className="text-xs font-black text-zinc-400">
                    PEDIDO #{pedido.id}
                  </p>

                  <h2 className="mt-1 text-2xl font-black text-zinc-900">
                    {pedido.nome}
                  </h2>

                  {pedido.whatsapp && (
                    <p className="mt-1 text-sm text-zinc-500">
                      📱 {pedido.whatsapp}
                    </p>
                  )}

                </div>

                {/* ========================= */}
                {/* ENDEREÇO */}
                {/* ========================= */}

                <div className="mt-5 rounded-2xl bg-zinc-100 p-4">

                  <p className="text-xs font-black uppercase text-zinc-400">
                    Endereço de entrega
                  </p>

                  <div className="mt-2 space-y-1 text-sm">

                    <p className="font-black text-zinc-900">
                      📍 {pedido.rua}, {pedido.numero}
                    </p>

                    {pedido.complemento && (
                      <p className="text-zinc-600">
                        {pedido.complemento}
                      </p>
                    )}

                    <p className="text-zinc-600">
                      {pedido.bairro}
                    </p>

                    <p className="text-zinc-600">
                      {pedido.cidade} - {pedido.estado}
                    </p>

                    <p className="text-zinc-500">
                      CEP: {pedido.cep}
                    </p>

                  </div>

                </div>

                {/* ========================= */}
                {/* PRODUTOS */}
                {/* ========================= */}

                <div className="mt-4 rounded-2xl border border-zinc-200 p-4">

                  <p className="font-bold text-zinc-900">
                    Pedido
                  </p>

                  <div className="mt-2 space-y-1 text-sm text-zinc-600">

                    {pedido.gas > 0 && (
                      <p>
                        🧯 {pedido.gas}x Botijão de cozinha
                      </p>
                    )}

                    {pedido.agua > 0 && (
                      <p>
                        💧 {pedido.agua}x Água
                      </p>
                    )}

                  </div>

                </div>

                {/* ========================= */}
                {/* OBSERVAÇÃO */}
                {/* ========================= */}

                {pedido.observacao && (
                  <div className="mt-4 rounded-2xl bg-yellow-50 p-4">

                    <p className="text-xs font-black uppercase text-yellow-600">
                      Observação
                    </p>

                    <p className="mt-1 text-sm text-zinc-700">
                      {pedido.observacao}
                    </p>

                  </div>
                )}

                {/* ========================= */}
                {/* BOTÕES */}
                {/* ========================= */}

                <div className="mt-6 space-y-3">

                  {/* GOOGLE MAPS */}

                  <button
                    type="button"
                    onClick={() =>
                      abrirRota(pedido)
                    }
                    className="w-full rounded-2xl bg-blue-600 p-4 font-black text-white transition hover:bg-blue-700 active:scale-[0.98]"
                  >
                    📍 ABRIR ROTA NO GOOGLE MAPS
                  </button>

                  {/* ENTREGUE */}

                  <button
                    type="button"
                    disabled={
                      atualizando === pedido.id
                    }
                    onClick={() =>
                      marcarEntregue(pedido.id)
                    }
                    className="w-full rounded-2xl bg-zinc-900 p-4 font-black text-white transition hover:bg-zinc-700 disabled:opacity-50"
                  >
                    {atualizando === pedido.id
                      ? "ATUALIZANDO..."
                      : "✅ PEDIDO ENTREGUE"}
                  </button>

                </div>

              </div>
            );
          })}

        </div>

      </div>

    </main>
  );
}
