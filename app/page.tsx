"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Configuracao = {
  nome_empresa: string;
  texto_principal: string;
  cor_principal: string;
  cor_fundo: string;
  cor_card: string;

  imagem_logo: string | null;
  imagem_icone_gas: string | null;
  imagem_icone_agua: string | null;

  estilo_cards: string;

  cor_cabecalho: string;
  cor_fonte_cabecalho: string;
  subtitulo_cabecalho: string;
  mostrar_pedidos_online: boolean;

  tamanho_logo: number;
  tamanho_icone: number;
};

export default function Home() {
  const [config, setConfig] = useState<Configuracao>({
    nome_empresa: "JM GÁS",

    texto_principal:
      "Faça seu pedido de forma rápida e fácil.",

    cor_principal: "#dc2626",
    cor_fundo: "#f4f4f5",
    cor_card: "#ffffff",

    imagem_logo: "/botijao.jpg",
    imagem_icone_gas: "/botijao.jpg",
    imagem_icone_agua: "/agua.jpg",

    estilo_cards: "arredondado",

    cor_cabecalho: "#09090b",
    cor_fonte_cabecalho: "#ffffff",

    subtitulo_cabecalho:
      "Gás e água na sua casa",

    mostrar_pedidos_online: true,

    tamanho_logo: 56,
    tamanho_icone: 64,
  });

  // =========================
  // DADOS DO CLIENTE
  // =========================

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  // =========================
  // ENDEREÇO
  // =========================

  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const [buscandoCep, setBuscandoCep] = useState(false);

  // =========================
  // PRODUTOS
  // =========================

  const [gas, setGas] = useState(0);
  const [agua, setAgua] = useState(0);

  // =========================
  // OUTROS
  // =========================

  const [observacao, setObservacao] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  // =========================
  // CONFIGURAÇÃO
  // =========================

  useEffect(() => {
    carregarConfiguracao();
  }, []);

  async function carregarConfiguracao() {
    const { data, error } = await supabase
      .from("configuracao")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      console.error(
        "Erro ao carregar configuração:",
        error
      );

      return;
    }

    if (!data) return;

    setConfig({
      nome_empresa:
        data.nome_empresa || "JM GÁS",

      texto_principal:
        data.texto_principal ||
        "Faça seu pedido de forma rápida e fácil.",

      cor_principal:
        data.cor_principal || "#dc2626",

      cor_fundo:
        data.cor_fundo || "#f4f4f5",

      cor_card:
        data.cor_card || "#ffffff",

      imagem_logo:
        data.imagem_logo ||
        data.imagem_botijao ||
        "/botijao.jpg",

      imagem_icone_gas:
        data.imagem_icone_gas ||
        data.imagem_botijao ||
        "/botijao.jpg",

      imagem_icone_agua:
        data.imagem_icone_agua ||
        data.imagem_agua ||
        "/agua.jpg",

      estilo_cards:
        data.estilo_cards ||
        "arredondado",

      cor_cabecalho:
        data.cor_cabecalho ||
        "#09090b",

      cor_fonte_cabecalho:
        data.cor_fonte_cabecalho ||
        "#ffffff",

      subtitulo_cabecalho:
        data.subtitulo_cabecalho ||
        "Gás e água na sua casa",

      mostrar_pedidos_online:
        data.mostrar_pedidos_online ?? true,

      tamanho_logo:
        data.tamanho_logo || 56,

      tamanho_icone:
        data.tamanho_icone || 64,
    });
  }

  // =========================
  // BUSCAR CEP
  // =========================

  async function buscarCep(valor: string) {
    const cepLimpo = valor.replace(/\D/g, "");

    setCep(cepLimpo);

    if (cepLimpo.length !== 8) {
      return;
    }

    setBuscandoCep(true);
    setMensagem("");

    try {
      const resposta = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );

      if (!resposta.ok) {
        throw new Error("Erro na consulta do CEP");
      }

      const dados = await resposta.json();

      if (dados.erro) {
        setMensagem("CEP não encontrado.");
        setBuscandoCep(false);
        return;
      }

      setRua(dados.logradouro || "");
      setBairro(dados.bairro || "");
      setCidade(dados.localidade || "");
      setEstado(dados.uf || "");

      setMensagem("");
    } catch (error) {
      console.error(
        "Erro ao buscar CEP:",
        error
      );

      setMensagem(
        "Não foi possível consultar o CEP."
      );
    } finally {
      setBuscandoCep(false);
    }
  }

  // =========================
  // ESTILOS
  // =========================

  const radius =
    config.estilo_cards === "arredondado"
      ? "28px"
      : config.estilo_cards === "medio"
      ? "16px"
      : "4px";

  const cardRadius =
    config.estilo_cards === "arredondado"
      ? "20px"
      : config.estilo_cards === "medio"
      ? "12px"
      : "4px";

  // =========================
  // FAZER PEDIDO
  // =========================

  async function fazerPedido(
    e: React.FormEvent
  ) {
    e.preventDefault();

    // =========================
    // VALIDAR PRODUTO
    // =========================

    if (gas === 0 && agua === 0) {
      setMensagem(
        "Escolha pelo menos um produto."
      );

      return;
    }

    // =========================
    // VALIDAR DADOS
    // E-MAIL NÃO É OBRIGATÓRIO
    // =========================

    if (
      !nome ||
      !whatsapp ||
      !cep ||
      !rua ||
      !numero ||
      !bairro ||
      !cidade ||
      !estado
    ) {
      setMensagem(
        "Preencha todos os campos obrigatórios."
      );

      return;
    }

    setEnviando(true);
    setMensagem("");

    // =========================
    // MONTAR ENDEREÇO
    // =========================

    const enderecoCompleto = [
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep,
    ]
      .filter(Boolean)
      .join(", ");

    // =========================
    // ENVIAR PEDIDO
    // =========================

    const { error } = await supabase
      .from("pedidos")
      .insert({
        nome,
        email: email || null,
        whatsapp,

        endereco: enderecoCompleto,

        cep,
        rua,
        numero,
        complemento,
        bairro,
        cidade,
        estado,

        gas,
        agua,

        observacao,

        status: "novo",
      });

    // =========================
    // ERRO
    // =========================

    if (error) {
      console.error(
        "Erro ao enviar pedido:",
        error
      );

      setMensagem(
        "Não foi possível enviar o pedido. Tente novamente."
      );

      setEnviando(false);

      return;
    }

    // =========================
    // SUCESSO
    // =========================

    setMensagem(
      "Pedido recebido! A JM GÁS já anotou seu pedido. 🔥"
    );

    // =========================
    // LIMPAR DADOS
    // =========================

    setNome("");
    setEmail("");
    setWhatsapp("");

    setCep("");
    setRua("");
    setNumero("");
    setComplemento("");
    setBairro("");
    setCidade("");
    setEstado("");

    setGas(0);
    setAgua(0);

    setObservacao("");

    setEnviando(false);
  }

  return (
    <main
      className="min-h-screen transition-colors"
      style={{
        backgroundColor:
          config.cor_fundo,
      }}
    >

      {/* ========================= */}
      {/* CABEÇALHO */}
      {/* ========================= */}

      <header
        className="px-4 py-4 shadow-lg"
        style={{
          backgroundColor:
            config.cor_cabecalho,

          color:
            config.cor_fonte_cabecalho,
        }}
      >

        <div className="mx-auto flex max-w-2xl items-center justify-between">

          {/* LOGO */}

          <div className="flex items-center gap-3">

            <div
              className="flex items-center justify-center overflow-hidden rounded-xl bg-white shadow"
              style={{
                width:
                  config.tamanho_logo,

                height:
                  config.tamanho_logo,
              }}
            >

              <Image
                src={
                  config.imagem_logo ||
                  "/botijao.jpg"
                }
                alt="Logo"
                width={120}
                height={120}
                className="h-full w-full object-contain"
              />

            </div>

            <div>

              <h1
                className="text-xl font-black"
                style={{
                  color:
                    config.cor_fonte_cabecalho,
                }}
              >
                {config.nome_empresa}
              </h1>

              <p
                className="text-xs opacity-70"
                style={{
                  color:
                    config.cor_fonte_cabecalho,
                }}
              >
                {config.subtitulo_cabecalho}
              </p>

            </div>

          </div>

          {/* PEDIDOS ONLINE */}

          {config.mostrar_pedidos_online && (
            <div
              className="hidden rounded-lg border px-3 py-2 text-xs font-bold sm:block"
              style={{
                borderColor:
                  config.cor_fonte_cabecalho,

                color:
                  config.cor_fonte_cabecalho,

                opacity: 0.8,
              }}
            >
              PEDIDOS ONLINE
            </div>
          )}

        </div>

      </header>

      {/* ========================= */}
      {/* CONTEÚDO */}
      {/* ========================= */}

      <div className="mx-auto max-w-2xl px-4 py-8">

        {/* TÍTULO */}

        <div className="mb-7">

          <p
            className="mb-2 text-sm font-bold uppercase tracking-wider"
            style={{
              color:
                config.cor_principal,
            }}
          >
            Pedido rápido
          </p>

          <h2 className="text-4xl font-black tracking-tight text-zinc-950">
            Faça seu pedido
          </h2>

          <p className="mt-2 text-zinc-500">
            {config.texto_principal}
          </p>

        </div>

        <form
          onSubmit={fazerPedido}
          className="space-y-5"
        >

          {/* ========================= */}
          {/* PRODUTOS */}
          {/* ========================= */}

          <section
            className="p-5 shadow-sm ring-1 ring-zinc-200"
            style={{
              backgroundColor:
                config.cor_card,

              borderRadius: radius,
            }}
          >

            <div className="mb-5">

              <h3 className="text-lg font-black text-zinc-900">
                O que você precisa?
              </h3>

              <p className="text-sm text-zinc-500">
                Escolha a quantidade.
              </p>

            </div>

            {/* GÁS */}

            <div
              className="border border-zinc-200 p-4"
              style={{
                borderRadius:
                  cardRadius,
              }}
            >

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div
                    className="flex items-center justify-center overflow-hidden rounded-xl bg-red-50"
                    style={{
                      width:
                        config.tamanho_icone,

                      height:
                        config.tamanho_icone,
                    }}
                  >

                    <Image
                      src={
                        config.imagem_icone_gas ||
                        "/botijao.jpg"
                      }
                      alt="Botijão de cozinha"
                      width={120}
                      height={120}
                      className="h-full w-full object-contain"
                    />

                  </div>

                  <div>

                    <p className="font-black text-zinc-900">
                      Botijão de cozinha
                    </p>

                    <p className="text-xs text-zinc-500">
                      Gás de cozinha
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setGas(
                        Math.max(
                          0,
                          gas - 1
                        )
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-xl font-black text-zinc-700"
                  >
                    −
                  </button>

                  <span className="w-7 text-center text-lg font-black">
                    {gas}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setGas(gas + 1)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-xl font-black text-white"
                    style={{
                      backgroundColor:
                        config.cor_principal,
                    }}
                  >
                    +
                  </button>

                </div>

              </div>

            </div>

            {/* ÁGUA */}

            <div
              className="mt-3 border border-zinc-200 p-4"
              style={{
                borderRadius:
                  cardRadius,
              }}
            >

              <div className="flex items-center justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div
                    className="flex items-center justify-center overflow-hidden rounded-xl bg-blue-50"
                    style={{
                      width:
                        config.tamanho_icone,

                      height:
                        config.tamanho_icone,
                    }}
                  >

                    <Image
                      src={
                        config.imagem_icone_agua ||
                        "/agua.jpg"
                      }
                      alt="Água"
                      width={120}
                      height={120}
                      className="h-full w-full object-contain"
                    />

                  </div>

                  <div>

                    <p className="font-black text-zinc-900">
                      Água
                    </p>

                    <p className="text-xs text-zinc-500">
                      Água para sua casa
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      setAgua(
                        Math.max(
                          0,
                          agua - 1
                        )
                      )
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-xl font-black text-zinc-700"
                  >
                    −
                  </button>

                  <span className="w-7 text-center text-lg font-black">
                    {agua}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setAgua(agua + 1)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-xl font-black text-white"
                    style={{
                      backgroundColor:
                        config.cor_principal,
                    }}
                  >
                    +
                  </button>

                </div>

              </div>

            </div>

          </section>

          {/* ========================= */}
          {/* DADOS */}
          {/* ========================= */}

          <section
            className="p-5 shadow-sm ring-1 ring-zinc-200"
            style={{
              backgroundColor:
                config.cor_card,

              borderRadius: radius,
            }}
          >

            <div className="mb-5">

              <h3 className="text-lg font-black text-zinc-900">
                Seus dados
              </h3>

              <p className="text-sm text-zinc-500">
                Precisamos dessas informações para entregar seu pedido.
              </p>

            </div>

            {/* NOME */}

            <div>

              <label className="mb-2 block text-sm font-bold text-zinc-700">
                Nome *
              </label>

              <input
                type="text"
                value={nome}
                onChange={(e) =>
                  setNome(e.target.value)
                }
                placeholder="Como podemos te chamar?"
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none focus:border-red-500 focus:bg-white"
              />

            </div>

            {/* EMAIL */}

            <div className="mt-4">

              <label className="mb-2 block text-sm font-bold text-zinc-700">
                E-mail
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="seuemail@email.com (opcional)"
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none focus:border-red-500 focus:bg-white"
              />

            </div>

            {/* WHATSAPP */}

            <div className="mt-4">

              <label className="mb-2 block text-sm font-bold text-zinc-700">
                WhatsApp *
              </label>

              <input
                type="tel"
                value={whatsapp}
                onChange={(e) =>
                  setWhatsapp(e.target.value)
                }
                placeholder="(00) 00000-0000"
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none focus:border-red-500 focus:bg-white"
              />

            </div>

            {/* ENDEREÇO */}

            <div className="mt-6">

              <div className="mb-4">

                <h4 className="font-black text-zinc-900">
                  Endereço de entrega
                </h4>

                <p className="text-sm text-zinc-500">
                  Informe onde devemos entregar seu pedido.
                </p>

              </div>

              {/* CEP */}

              <div>

                <label className="mb-2 block text-sm font-bold text-zinc-700">
                  CEP *
                </label>

                <input
                  type="text"
                  value={cep}
                  onChange={(e) =>
                    buscarCep(e.target.value)
                  }
                  placeholder="00000-000"
                  maxLength={9}
                  inputMode="numeric"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none focus:border-red-500 focus:bg-white"
                />

                {buscandoCep && (
                  <p className="mt-2 text-xs font-semibold text-zinc-500">
                    Buscando endereço...
                  </p>
                )}

              </div>

              {/* RUA */}

              <div className="mt-4">

                <label className="mb-2 block text-sm font-bold text-zinc-700">
                  Rua *
                </label>

                <input
                  type="text"
                  value={rua}
                  onChange={(e) =>
                    setRua(e.target.value)
                  }
                  placeholder="Nome da rua"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none focus:border-red-500 focus:bg-white"
                />

              </div>

              {/* NÚMERO + COMPLEMENTO */}

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-bold text-zinc-700">
                    Número *
                  </label>

                  <input
                    type="text"
                    value={numero}
                    onChange={(e) =>
                      setNumero(e.target.value)
                    }
                    placeholder="123"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none focus:border-red-500 focus:bg-white"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-bold text-zinc-700">
                    Complemento
                  </label>

                  <input
                    type="text"
                    value={complemento}
                    onChange={(e) =>
                      setComplemento(e.target.value)
                    }
                    placeholder="Casa, apto..."
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none focus:border-red-500 focus:bg-white"
                  />

                </div>

              </div>

              {/* BAIRRO */}

              <div className="mt-4">

                <label className="mb-2 block text-sm font-bold text-zinc-700">
                  Bairro *
                </label>

                <input
                  type="text"
                  value={bairro}
                  onChange={(e) =>
                    setBairro(e.target.value)
                  }
                  placeholder="Nome do bairro"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none focus:border-red-500 focus:bg-white"
                />

              </div>

              {/* CIDADE + ESTADO */}

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_120px]">

                <div>

                  <label className="mb-2 block text-sm font-bold text-zinc-700">
                    Cidade *
                  </label>

                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) =>
                      setCidade(e.target.value)
                    }
                    placeholder="Sua cidade"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none focus:border-red-500 focus:bg-white"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-bold text-zinc-700">
                    Estado *
                  </label>

                  <input
                    type="text"
                    value={estado}
                    onChange={(e) =>
                      setEstado(
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="SP"
                    maxLength={2}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 uppercase outline-none focus:border-red-500 focus:bg-white"
                  />

                </div>

              </div>

            </div>

            {/* OBSERVAÇÃO */}

            <div className="mt-4">

              <label className="mb-2 block text-sm font-bold text-zinc-700">
                Observação
              </label>

              <textarea
                value={observacao}
                onChange={(e) =>
                  setObservacao(e.target.value)
                }
                placeholder="Ex: tocar campainha, deixar com o vizinho..."
                rows={3}
                className="w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3.5 outline-none focus:border-red-500 focus:bg-white"
              />

            </div>

          </section>

          {/* MENSAGEM */}

          {mensagem && (
            <div className="rounded-2xl bg-zinc-900 p-4 text-center text-sm font-bold text-white">
              {mensagem}
            </div>
          )}

          {/* BOTÃO */}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-2xl px-6 py-5 text-lg font-black text-white shadow-lg transition hover:brightness-90 active:scale-[0.98] disabled:opacity-60"
            style={{
              backgroundColor:
                config.cor_principal,
            }}
          >

            {enviando
              ? "ENVIANDO PEDIDO..."
              : "🔥 FAZER PEDIDO"}

          </button>

          <p className="pb-6 text-center text-xs text-zinc-400">
            Ao enviar, seus dados serão utilizados para realizar a entrega.
          </p>

        </form>

      </div>

    </main>
  );
}
