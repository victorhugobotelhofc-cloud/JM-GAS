"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Pedido = {
  id: number;
  nome: string;
  whatsapp: string;
  email: string | null;
  endereco: string;
  gas: number;
  agua: number;
  observacao: string | null;
  status: string;
  criado_em: string;
};

export default function PainelJM() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState<number | null>(null);

  async function carregarPedidos() {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setPedidos(data || []);
    setCarregando(false);
  }

  async function mudarStatus(id: number, novoStatus: string) {
    setAtualizando(id);

    const { error } = await supabase
      .from("pedidos")
      .update({ status: novoStatus })
      .eq("id", id);

    if (error) {
      console.error(error);
      setAtualizando(null);
      return;
    }

    setPedidos((pedidosAtuais) =>
      pedidosAtuais.map((pedido) =>
        pedido.id === id
          ? { ...pedido, status: novoStatus }
          : pedido
      )
    );

    setAtualizando(null);
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  function statusCor(status: string) {
    if (status === "novo") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (status === "aceito") {
      return "bg-orange-100 text-orange-700";
    }

    if (status === "em_entrega") {
      return "bg-blue-100 text-blue-700";
    }

    if (status === "entregue") {
      return "bg-green-100 text-green-700";
    }

    return "bg-zinc-100 text-zinc-700";
  }

  function statusNome(status: string) {
    if (status === "novo") return "NOVO";
    if (status === "aceito") return "ACEITO";
    if (status === "em_entrega") return "EM ENTREGA";
    if (status === "entregue") return "ENTREGUE";

    return status.toUpperCase();
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">

        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-zinc-900">
            PAINEL JM
          </h1>

          <p className="mt-1 text-zinc-500">
            Gerenciamento de pedidos
          </p>
        </div>

        {/* Carregando */}
        {carregando && (
          <div className="rounded-2xl bg-white p-6 shadow">
            Carregando pedidos...
          </div>
        )}

        {/* Nenhum pedido */}
        {!carregando && pedidos.length === 0 && (
          <div className="rounded-2xl bg-white p-8 text-center shadow">
            <p className="font-bold text-zinc-900">
              Nenhum pedido encontrado.
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Os novos pedidos aparecerão aqui.
            </p>
          </div>
        )}

        {/* Pedidos */}
        {!carregando && pedidos.length > 0 && (
          <div className="space-y-5">

            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="rounded-3xl bg-white p-6 shadow"
              >

                {/* Cliente */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div>
                    <p className="text-xs font-bold text-zinc-400">
                      PEDIDO #{pedido.id}
                    </p>

                    <h2 className="mt-1 text-2xl font-black text-zinc-900">
                      {pedido.nome}
                    </h2>

                    <div className="mt-2 space-y-1 text-sm text-zinc-500">
                      <p>📱 {pedido.whatsapp}</p>
                      {pedido.email && <p>✉️ {pedido.email}</p>}
                      <p>📍 {pedido.endereco}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <span
                    className={`w-fit rounded-full px-4 py-2 text-xs font-black ${statusCor(
                      pedido.status
                    )}`}
                  >
                    {statusNome(pedido.status)}
                  </span>

                </div>

                {/* Produtos */}
                <div className="mt-6 rounded-2xl bg-zinc-50 p-4">
                  <p className="font-bold text-zinc-900">
                    Produtos
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

                {/* Observação */}
                {pedido.observacao && (
                  <div className="mt-4 rounded-2xl bg-zinc-100 p-4">
                    <p className="text-xs font-black uppercase text-zinc-400">
                      Observação
                    </p>

                    <p className="mt-1 text-sm text-zinc-700">
                      {pedido.observacao}
                    </p>
                  </div>
                )}

                {/* Ações */}
                <div className="mt-6 border-t border-zinc-100 pt-5">

                  <p className="mb-3 text-sm font-bold text-zinc-900">
                    Alterar status
                  </p>

                  <div className="flex flex-wrap gap-2">

                    <button
                      type="button"
                      disabled={atualizando === pedido.id}
                      onClick={() =>
                        mudarStatus(pedido.id, "novo")
                      }
                      className="rounded-xl bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-700 hover:bg-yellow-200 disabled:opacity-50"
                    >
                      Novo
                    </button>

                    <button
                      type="button"
                      disabled={atualizando === pedido.id}
                      onClick={() =>
                        mudarStatus(pedido.id, "aceito")
                      }
                      className="rounded-xl bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700 hover:bg-orange-200 disabled:opacity-50"
                    >
                      Aceito
                    </button>

                    <button
                      type="button"
                      disabled={atualizando === pedido.id}
                      onClick={() =>
                        mudarStatus(pedido.id, "em_entrega")
                      }
                      className="rounded-xl bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-200 disabled:opacity-50"
                    >
                      Em entrega
                    </button>

                    <button
                      type="button"
                      disabled={atualizando === pedido.id}
                      onClick={() =>
                        mudarStatus(pedido.id, "entregue")
                      }
                      className="rounded-xl bg-green-100 px-4 py-2 text-sm font-bold text-green-700 hover:bg-green-200 disabled:opacity-50"
                    >
                      Entregue
                    </button>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}