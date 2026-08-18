```tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
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

type DadosCliente = {
  nome: string;
  email: string;
  whatsapp: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
};

const CHAVE_DADOS_CLIENTE = "jm-gas-dados-cliente";

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
    subtitulo_cabecalho: "Gás e água na sua casa",
    mostrar_pedidos_online: true,

    tamanho_logo: 56,
    tamanho_icone: 64,
  });

  // =========================
  // CLIENTE
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
  // PEDIDO
  // =========================

  const [observacao, setObservacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  // =========================
  // CARREGAR DADOS SALVOS
  // =========================

  useEffect(() => {
    try {
      const dadosSalvos = localStorage.getItem(
        CHAVE_DADOS_CLIENTE
      );

      if (!dadosSalvos) return;

      const dados: Partial<DadosCliente> =
        JSON.parse(dadosSalvos);

      setNome(dados.nome || "");
      setEmail(dados.email || "");
      setWhatsapp(dados.whatsapp || "");

      setCep(dados.cep || "");
      setRua(dados.rua || "");
      setNumero(dados.numero || "");
      setComplemento(dados.complemento || "");
      setBairro(dados.bairro || "");
      setCidade(dados.cidade || "");
      setEstado(dados.estado || "");
    } catch (error) {
      console.error(
        "Erro ao carregar dados salvos:",
        error
      );
    }
  }, []);

  // =========================
  // SALVAR DADOS AUTOMÁTICOS
  // =========================

  useEffect(() => {
    const dadosCliente: DadosCliente = {
      nome,
      email,
      whatsapp,
      cep,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
    };

    try {
      localStorage.setItem(
        CHAVE_DADOS_CLIENTE,
        JSON.stringify(dadosCliente)
      );
    } catch (error) {
      console.error(
        "Erro ao salvar dados do cliente:",
        error
      );
    }
  }, [
    nome,
    email,
    whatsapp,
    cep,
    rua,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
  ]);

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
        data.estilo_cards || "arredondado",

      cor_cabecalho:
        data.cor_cabecalho || "#09090b",

      cor_fonte_cabecalho:
        data.cor_fonte_cabecalho || "#ffffff",

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
    const cepLimpo = valor
      .replace(/\D/g, "")
      .slice(0, 8);

    const cepFormatado =
      cepLimpo.length > 5
        ? `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`
        : cepLimpo;

    setCep(cepFormatado);

    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    setMensagem("");

    try {
      const resposta = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );

      if (!resposta.ok) {
        throw new Error(
          "Erro ao consultar CEP"
        );
      }

      const dados = await resposta.json();

      if (dados.erro) {
        setMensagem("CEP não encontrado.");
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
      ? "18px"
      : "8px";

  // =========================
  // RESUMO
  // =========================

  const totalItens = gas + agua;

  const resumoProdutos = useMemo(() => {
    const itens: string[] = [];

    if (gas > 0) {
      itens.push(
        `${gas}x Botijão`
      );
    }

    if (agua > 0) {
      itens.push(
        `${agua}x Água`
      );
    }

    return itens.length
      ? itens.join(" + ")
      : "Nenhum produto selecionado";
  }, [gas, agua]);

  // =========================
  // FAZER PEDIDO
  // =========================

  async function fazerPedido(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (gas === 0 && agua === 0) {
      setMensagem(
        "Escolha pelo menos um produto."
      );

      return;
    }

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

    const { error } = await supabase
      .from("pedidos")
      .insert({
        nome,
        email: email.trim(),
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

    if (error) {
      console.error(
        "Erro ao enviar pedido:",
        error
      );

      setMensagem(
        `Erro ao enviar pedido: ${error.message}`
      );

      setEnviando(false);
      return;
    }

    setMensagem(
      "Pedido recebido com sucesso! 🔥"
    );

    setGas(0);
    setAgua(0);
    setObservacao("");

    setEnviando(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: config.cor_fundo,
      }}
    >

      {/* ========================= */}
      {/* CABEÇALHO */}
      {/* ========================= */}

      <header
        className="relative overflow-hidden shadow-xl"
        style={{
          backgroundColor:
            config.cor_cabecalho,
          color: config.cor_fonte_cabecalho,
        }}
      >

        {/* detalhe visual */}

        <div
          className="absolute -right-20 -top-20 h-48 w-48 rounded-full opacity-20 blur-3xl"
          style={{
            backgroundColor:
              config.cor_principal,
          }}
        />

        <div
          className="absolute -bottom-24 -left-20 h-52 w-52 rounded-full opacity-10 blur-3xl"
          style={{
            backgroundColor:
              config.cor_principal,
          }}
        />

        <div className="relative mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-6">

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-4">

              <div
                className="flex shrink-0 items-center justify-center overflow-hidden bg-white shadow-lg"
                style={{
                  width:
                    Math.max(
                      config.tamanho_logo,
                      56
                    ),
                  height:
                    Math.max(
                      config.tamanho_logo,
                      56
                    ),
                  borderRadius:
                    radius,
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

                <p className="text-[10px] font-black uppercase tracking-[0.28em] opacity-60">
                  JM GÁS
                </p>

                <h1
                  className="mt-0.5 text-2xl font-black tracking-tight sm:text-3xl"
                  style={{
                    color:
                      config.cor_fonte_cabecalho,
                  }}
                >
                  {config.nome_empresa}
                </h1>

                <p
                  className="mt-1 text-xs opacity-70 sm:text-sm"
                  style={{
                    color:
                      config.cor_fonte_cabecalho,
                  }}
                >
                  {config.subtitulo_cabecalho}
                </p>

              </div>

            </div>

            {config.mostrar_pedidos_online && (
              <div
                className="hidden rounded-2xl border px-4 py-3 text-right sm:block"
                style={{
                  borderColor:
                    config.cor_fonte_cabecalho,
                  color:
                    config.cor_fonte_cabecalho,
                }}
              >
                <p className="text-[9px] font-black tracking-widest opacity-60">
                  STATUS
                </p>

                <p className="mt-1 text-xs font-black">
                  PEDIDOS ONLINE
                </p>
              </div>
            )}

          </div>

        </div>
      </header>

      {/* ========================= */}
      {/* CONTEÚDO */}
      {/* ========================= */}

      <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6 sm:py-10">

        {/* HERO */}

        <section className="mb-7">

          <div
            className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black"
            style={{
              backgroundColor: `${config.cor_principal}15`,
              color: config.cor_principal,
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor:
                  config.cor_principal,
              }}
            />
            PEDIDO RÁPIDO
          </div>

          <h2 className="text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl">
            Faça seu pedido
          </h2>

          <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-500">
            {config.texto_principal}
          </p>

        </section>

        <form
          onSubmit={fazerPedido}
          className="space-y-5"
        >

          {/* ========================= */}
          {/* PRODUTOS */}
          {/* ========================= */}

          <section
            className="overflow-hidden bg-white shadow-sm ring-1 ring-zinc-200"
            style={{
              backgroundColor:
                config.cor_card,
              borderRadius: radius,
            }}
          >

            <div className="border-b border-zinc-100 px-5 py-5 sm:px-6">

              <div className="flex items-end justify-between gap-4">

                <div>
                  <p
                    className="text-xs font-black uppercase tracking-widest"
                    style={{
                      color:
                        config.cor_principal,
                    }}
                  >
                    01
                  </p>

                  <h3 className="mt-1 text-xl font-black text-zinc-950">
                    Escolha seus produtos
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    Selecione a quantidade.
                  </p>
                </div>

                <div className="hidden rounded-xl bg-zinc-50 px-3 py-2 text-right sm:block">

                  <p className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                    Itens
                  </p>

                  <p className="text-lg font-black text-zinc-900">
                    {totalItens}
                  </p>

                </div>

              </div>

            </div>

            <div className="space-y-3 p-5 sm:p-6">

              {/* GÁS */}

              <div
                className="overflow-hidden border border-zinc-200 bg-white transition hover:border-red-200 hover:shadow-sm"
                style={{
                  borderRadius:
                    Math.max(
                      parseInt(radius),
                      14
                    ),
                }}
              >

                <div className="flex items-center gap-4 p-4 sm:p-5">

                  <div
                    className="flex shrink-0 items-center justify-center overflow-hidden bg-red-50"
                    style={{
                      width:
                        Math.max(
                          config.tamanho_icone,
                          68
                        ),
                      height:
                        Math.max(
                          config.tamanho_icone,
                          68
                        ),
                      borderRadius:
                        Math.max(
                          parseInt(radius) - 8,
                          12
                        ),
                    }}
                  >
                    <Image
                      src={
                        config.imagem_icone_gas ||
                        "/botijao.jpg"
                      }
                      alt="Botijão"
                      width={100}
                      height={100}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-base font-black text-zinc-950">
                      Botijão de cozinha
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Gás de cozinha
                    </p>

                    <p
                      className="mt-2 text-xs font-bold"
                      style={{
                        color:
                          config.cor_principal,
                      }}
                    >
                      Produto essencial
                    </p>

                  </div>

                  <div className="flex shrink-0 items-center gap-2">

                    <button
                      type="button"
                      aria-label="Diminuir gás"
                      onClick={() =>
                        setGas(
                          Math.max(
                            0,
                            gas - 1
                          )
                        )
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-xl font-black text-zinc-700 transition hover:bg-zinc-200 active:scale-95"
                    >
                      −
                    </button>

                    <span className="w-8 text-center text-lg font-black text-zinc-950">
                      {gas}
                    </span>

                    <button
                      type="button"
                      aria-label="Aumentar gás"
                      onClick={() =>
                        setGas(gas + 1)
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-xl font-black text-white shadow-sm transition hover:brightness-95 active:scale-95"
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
                className="overflow-hidden border border-zinc-200 bg-white transition hover:border-blue-200 hover:shadow-sm"
                style={{
                  borderRadius:
                    Math.max(
                      parseInt(radius),
                      14
                    ),
                }}
              >

                <div className="flex items-center gap-4 p-4 sm:p-5">

                  <div
                    className="flex shrink-0 items-center justify-center overflow-hidden bg-blue-50"
                    style={{
                      width:
                        Math.max(
                          config.tamanho_icone,
                          68
                        ),
                      height:
                        Math.max(
                          config.tamanho_icone,
                          68
                        ),
                      borderRadius:
                        Math.max(
                          parseInt(radius) - 8,
                          12
                        ),
                    }}
                  >
                    <Image
                      src={
                        config.imagem_icone_agua ||
                        "/agua.jpg"
                      }
                      alt="Água"
                      width={100}
                      height={100}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-base font-black text-zinc-950">
                      Água
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      Água para sua casa
                    </p>

                    <p className="mt-2 text-xs font-bold text-blue-600">
                      Entrega rápida
                    </p>

                  </div>

                  <div className="flex shrink-0 items-center gap-2">

                    <button
                      type="button"
                      aria-label="Diminuir água"
                      onClick={() =>
                        setAgua(
                          Math.max(
                            0,
                            agua - 1
                          )
                        )
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-xl font-black text-zinc-700 transition hover:bg-zinc-200 active:scale-95"
                    >
                      −
                    </button>

                    <span className="w-8 text-center text-lg font-black text-zinc-950">
                      {agua}
                    </span>

                    <button
                      type="button"
                      aria-label="Aumentar água"
                      onClick={() =>
                        setAgua(agua + 1)
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-xl font-black text-white shadow-sm transition hover:brightness-95 active:scale-95"
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

              {/* RESUMO */}

              <div className="mt-4 rounded-2xl bg-zinc-950 px-4 py-4 text-white">

                <div className="flex items-center justify-between gap-4">

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
                      Seu pedido
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      {resumoProdutos}
                    </p>
                  </div>

                  <div className="text-right">

                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                      Quantidade
                    </p>

                    <p className="mt-1 text-xl font-black">
                      {totalItens}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* ========================= */}
          {/* DADOS DO CLIENTE */}
          {/* ========================= */}

          <section
            className="overflow-hidden bg-white shadow-sm ring-1 ring-zinc-200"
            style={{
              backgroundColor:
                config.cor_card,
              borderRadius: radius,
            }}
          >

            <div className="border-b border-zinc-100 px-5 py-5 sm:px-6">

              <p
                className="text-xs font-black uppercase tracking-widest"
                style={{
                  color:
                    config.cor_principal,
                }}
              >
                02
              </p>

              <h3 className="mt-1 text-xl font-black text-zinc-950">
                Seus dados
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Usaremos essas informações para a entrega.
              </p>

            </div>

            <div className="space-y-4 p-5 sm:p-6">

              {/* NOME */}

              <div>
                <label className="mb-2 block text-sm font-black text-zinc-700">
                  Nome *
                </label>

                <input
                  type="text"
                  value={nome}
                  onChange={(e) =>
                    setNome(e.target.value)
                  }
                  placeholder="Seu nome"
                  autoComplete="name"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500 focus:bg-white"
                />
              </div>

              {/* WHATSAPP */}

              <div>
                <label className="mb-2 block text-sm font-black text-zinc-700">
                  WhatsApp *
                </label>

                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) =>
                    setWhatsapp(e.target.value)
                  }
                  placeholder="(00) 00000-0000"
                  autoComplete="tel"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500 focus:bg-white"
                />
              </div>

              {/* EMAIL */}

              <div>
                <label className="mb-2 block text-sm font-black text-zinc-700">
                  E-mail{" "}
                  <span className="font-normal text-zinc-400">
                    (opcional)
                  </span>
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="seuemail@email.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500 focus:bg-white"
                />
              </div>

            </div>

          </section>

          {/* ========================= */}
          {/* ENDEREÇO */}
          {/* ========================= */}

          <section
            className="overflow-hidden bg-white shadow-sm ring-1 ring-zinc-200"
            style={{
              backgroundColor:
                config.cor_card,
              borderRadius: radius,
            }}
          >

            <div className="border-b border-zinc-100 px-5 py-5 sm:px-6">

              <p
                className="text-xs font-black uppercase tracking-widest"
                style={{
                  color:
                    config.cor_principal,
                }}
              >
                03
              </p>

              <h3 className="mt-1 text-xl font-black text-zinc-950">
                Endereço de entrega
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Informe exatamente onde devemos entregar.
              </p>

            </div>

            <div className="space-y-4 p-5 sm:p-6">

              {/* CEP */}

              <div>
                <label className="mb-2 block text-sm font-black text-zinc-700">
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
                  autoComplete="postal-code"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 font-mono outline-none transition focus:border-red-500 focus:bg-white"
                />

                {buscandoCep && (
                  <p className="mt-2 text-xs font-semibold text-zinc-500">
                    Buscando endereço...
                  </p>
                )}
              </div>

              {/* RUA */}

              <div>
                <label className="mb-2 block text-sm font-black text-zinc-700">
                  Rua *
                </label>

                <input
                  type="text"
                  value={rua}
                  onChange={(e) =>
                    setRua(e.target.value)
                  }
                  placeholder="Nome da rua"
                  autoComplete="street-address"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500 focus:bg-white"
                />
              </div>

              {/* NUMERO / COMPLEMENTO */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-black text-zinc-700">
                    Número *
                  </label>

                  <input
                    type="text"
                    value={numero}
                    onChange={(e) =>
                      setNumero(e.target.value)
                    }
                    placeholder="123"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-zinc-700">
                    Complemento
                  </label>

                  <input
                    type="text"
                    value={complemento}
                    onChange={(e) =>
                      setComplemento(
                        e.target.value
                      )
                    }
                    placeholder="Casa, apto..."
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500 focus:bg-white"
                  />
                </div>

              </div>

              {/* BAIRRO */}

              <div>
                <label className="mb-2 block text-sm font-black text-zinc-700">
                  Bairro *
                </label>

                <input
                  type="text"
                  value={bairro}
                  onChange={(e) =>
                    setBairro(e.target.value)
                  }
                  placeholder="Nome do bairro"
                  autoComplete="address-level3"
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500 focus:bg-white"
                />
              </div>

              {/* CIDADE / ESTADO */}

              <div className="grid gap-4 sm:grid-cols-[1fr_120px]">

                <div>
                  <label className="mb-2 block text-sm font-black text-zinc-700">
                    Cidade *
                  </label>

                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) =>
                      setCidade(e.target.value)
                    }
                    placeholder="Sua cidade"
                    autoComplete="address-level2"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-zinc-700">
                    UF *
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
                    autoComplete="address-level1"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 font-mono uppercase outline-none transition focus:border-red-500 focus:bg-white"
                  />
                </div>

              </div>

            </div>

          </section>

          {/* ========================= */}
          {/* OBSERVAÇÃO */}
          {/* ========================= */}

          <section
            className="overflow-hidden bg-white shadow-sm ring-1 ring-zinc-200"
            style={{
              backgroundColor:
                config.cor_card,
              borderRadius: radius,
            }}
          >

            <div className="border-b border-zinc-100 px-5 py-5 sm:px-6">

              <p
                className="text-xs font-black uppercase tracking-widest"
                style={{
                  color:
                    config.cor_principal,
                }}
              >
                04
              </p>

              <h3 className="mt-1 text-xl font-black text-zinc-950">
                Observação
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Alguma informação importante para a entrega?
              </p>

            </div>

            <div className="p-5 sm:p-6">

              <textarea
                value={observacao}
                onChange={(e) =>
                  setObservacao(
                    e.target.value
                  )
                }
                placeholder="Ex.: tocar campainha, casa dos fundos..."
                rows={4}
                className="w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 outline-none transition focus:border-red-500 focus:bg-white"
              />

            </div>

          </section>

          {/* ========================= */}
          {/* MENSAGEM */}
          {/* ========================= */}

          {mensagem && (
            <div
              className={`rounded-2xl p-4 text-center text-sm font-black ${
                mensagem.startsWith(
                  "Pedido recebido"
                )
                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                  : "bg-red-50 text-red-700 ring-1 ring-red-200"
              }`}
            >
              {mensagem}
            </div>
          )}

          {/* ========================= */}
          {/* FINALIZAR PEDIDO */}
          {/* ========================= */}

          <section
            className="overflow-hidden shadow-xl"
            style={{
              backgroundColor:
                config.cor_card,
              borderRadius: radius,
            }}
          >

            <div className="p-5 sm:p-6">

              <div className="mb-4 flex items-center justify-between gap-4">

                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    Resumo final
                  </p>

                  <p className="mt-1 text-base font-black text-zinc-950">
                    {resumoProdutos}
                  </p>
                </div>

                <div
                  className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl"
                  style={{
                    backgroundColor:
                      `${config.cor_principal}15`,
                  }}
                >
                  <Image
                    src={
                      config.imagem_logo ||
                      "/botijao.jpg"
                    }
                    alt="JM GÁS"
                    width={48}
                    height={48}
                    className="h-full w-full object-contain p-1"
                  />
                </div>

              </div>

              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-2xl px-6 py-5 text-lg font-black text-white shadow-lg transition hover:brightness-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  backgroundColor:
                    config.cor_principal,
                }}
              >
                {enviando
                  ? "ENVIANDO PEDIDO..."
                  : "🔥 CONFIRMAR PEDIDO"}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-zinc-400">
                Seus dados são usados somente para processar
                e entregar o pedido.
              </p>

            </div>

          </section>

        </form>

      </div>

      {/* RODAPÉ */}

      <footer className="border-t border-zinc-200 bg-white px-4 py-6 text-center">

        <p className="text-sm font-black text-zinc-700">
          {config.nome_empresa}
        </p>

        <p className="mt-1 text-xs text-zinc-400">
          Gás e água na sua casa
        </p>

      </footer>

    </main>
  );
}
```
