"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ConfigPage() {
  const router = useRouter();

  const [verificandoLogin, setVerificandoLogin] =
    useState(true);

  const [nomeEmpresa, setNomeEmpresa] =
    useState("JM GÁS");

  const [textoPrincipal, setTextoPrincipal] =
    useState(
      "Faça seu pedido de forma rápida e fácil."
    );

  const [corPrincipal, setCorPrincipal] =
    useState("#dc2626");

  const [corFundo, setCorFundo] =
    useState("#f4f4f5");

  const [corCard, setCorCard] =
    useState("#ffffff");

  const [corCabecalho, setCorCabecalho] =
    useState("#09090b");

  const [corFonteCabecalho, setCorFonteCabecalho] =
    useState("#ffffff");

  const [subtituloCabecalho, setSubtituloCabecalho] =
    useState("Gás e água na sua casa");

  const [imagemLogo, setImagemLogo] =
    useState("/botijao.jpg");

  const [imagemGas, setImagemGas] =
    useState("/botijao.jpg");

  const [imagemAgua, setImagemAgua] =
    useState("/agua.jpg");

  const [mostrarPedidos, setMostrarPedidos] =
    useState(true);

  const [tamanhoLogo, setTamanhoLogo] =
    useState(56);

  const [tamanhoIcone, setTamanhoIcone] =
    useState(64);

  const [estiloCards, setEstiloCards] =
    useState("arredondado");

  const [salvando, setSalvando] =
    useState(false);

  const [mensagem, setMensagem] =
    useState("");

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
        router.replace(
          "/login?next=/config"
        );
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
          router.replace(
            "/login?next=/config"
          );
        }
      }
    );

    return () => {
      cancelado = true;
      subscription.unsubscribe();
    };
  }, [router]);

  // =========================
  // CARREGAR CONFIGURAÇÃO
  // =========================

  useEffect(() => {
    if (verificandoLogin) return;

    carregarConfiguracao();
  }, [verificandoLogin]);

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

      setMensagem(
        `Erro ao carregar configuração: ${error.message}`
      );

      return;
    }

    if (!data) return;

    setNomeEmpresa(
      data.nome_empresa || "JM GÁS"
    );

    setTextoPrincipal(
      data.texto_principal ||
        "Faça seu pedido de forma rápida e fácil."
    );

    setCorPrincipal(
      data.cor_principal || "#dc2626"
    );

    setCorFundo(
      data.cor_fundo || "#f4f4f5"
    );

    setCorCard(
      data.cor_card || "#ffffff"
    );

    setCorCabecalho(
      data.cor_cabecalho || "#09090b"
    );

    setCorFonteCabecalho(
      data.cor_fonte_cabecalho ||
        "#ffffff"
    );

    setSubtituloCabecalho(
      data.subtitulo_cabecalho ||
        "Gás e água na sua casa"
    );

    setImagemLogo(
      data.imagem_logo ||
        data.imagem_botijao ||
        "/botijao.jpg"
    );

    setImagemGas(
      data.imagem_icone_gas ||
        data.imagem_botijao ||
        "/botijao.jpg"
    );

    setImagemAgua(
      data.imagem_icone_agua ||
        data.imagem_agua ||
        "/agua.jpg"
    );

    setMostrarPedidos(
      data.mostrar_pedidos_online ?? true
    );

    setTamanhoLogo(
      data.tamanho_logo || 56
    );

    setTamanhoIcone(
      data.tamanho_icone || 64
    );

    setEstiloCards(
      data.estilo_cards || "arredondado"
    );

    setMensagem("");
  }

  // =========================
  // SALVAR CONFIGURAÇÃO
  // =========================

  async function salvarConfiguracao() {
    setSalvando(true);
    setMensagem("");

    try {
      // Verifica novamente se existe usuário logado
      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario || !user) {
        setMensagem(
          "Sua sessão expirou. Faça login novamente."
        );

        router.replace(
          "/login?next=/config"
        );

        return;
      }

      // Procura a configuração existente
      const {
        data: configuracao,
        error: erroBusca,
      } = await supabase
        .from("configuracao")
        .select("id")
        .limit(1)
        .single();

      if (erroBusca) {
        console.error(
          "Erro ao encontrar configuração:",
          erroBusca
        );

        setMensagem(
          `Erro ao encontrar configuração: ${erroBusca.message}`
        );

        return;
      }

      if (!configuracao) {
        setMensagem(
          "Configuração não encontrada."
        );

        return;
      }

      // Atualiza a configuração
      const { error } = await supabase
        .from("configuracao")
        .update({
          nome_empresa: nomeEmpresa,
          texto_principal: textoPrincipal,

          cor_principal: corPrincipal,
          cor_fundo: corFundo,
          cor_card: corCard,

          cor_cabecalho: corCabecalho,
          cor_fonte_cabecalho:
            corFonteCabecalho,

          subtitulo_cabecalho:
            subtituloCabecalho,

          imagem_logo: imagemLogo,
          imagem_icone_gas: imagemGas,
          imagem_icone_agua: imagemAgua,

          mostrar_pedidos_online:
            mostrarPedidos,

          tamanho_logo: tamanhoLogo,
          tamanho_icone: tamanhoIcone,

          estilo_cards: estiloCards,
        })
        .eq("id", configuracao.id);

      if (error) {
        console.error(
          "Erro ao salvar configuração:",
          error
        );

        setMensagem(
          `Erro ao salvar: ${error.message}`
        );

        return;
      }

      // Confirma que realmente foi atualizado
      const {
        data: configuracaoAtualizada,
        error: erroConfirmacao,
      } = await supabase
        .from("configuracao")
        .select("*")
        .eq("id", configuracao.id)
        .single();

      if (erroConfirmacao) {
        console.error(
          "Erro ao confirmar alteração:",
          erroConfirmacao
        );

        setMensagem(
          "Configuração salva, mas não foi possível confirmar a alteração."
        );

        return;
      }

      // Atualiza a tela com o que realmente está no banco
      if (configuracaoAtualizada) {
        setNomeEmpresa(
          configuracaoAtualizada.nome_empresa ||
            "JM GÁS"
        );

        setTextoPrincipal(
          configuracaoAtualizada.texto_principal ||
            "Faça seu pedido de forma rápida e fácil."
        );

        setCorPrincipal(
          configuracaoAtualizada.cor_principal ||
            "#dc2626"
        );

        setCorFundo(
          configuracaoAtualizada.cor_fundo ||
            "#f4f4f5"
        );

        setCorCard(
          configuracaoAtualizada.cor_card ||
            "#ffffff"
        );

        setCorCabecalho(
          configuracaoAtualizada.cor_cabecalho ||
            "#09090b"
        );

        setCorFonteCabecalho(
          configuracaoAtualizada.cor_fonte_cabecalho ||
            "#ffffff"
        );

        setSubtituloCabecalho(
          configuracaoAtualizada.subtitulo_cabecalho ||
            "Gás e água na sua casa"
        );

        setImagemLogo(
          configuracaoAtualizada.imagem_logo ||
            configuracaoAtualizada.imagem_botijao ||
            "/botijao.jpg"
        );

        setImagemGas(
          configuracaoAtualizada.imagem_icone_gas ||
            configuracaoAtualizada.imagem_botijao ||
            "/botijao.jpg"
        );

        setImagemAgua(
          configuracaoAtualizada.imagem_icone_agua ||
            configuracaoAtualizada.imagem_agua ||
            "/agua.jpg"
        );

        setMostrarPedidos(
          configuracaoAtualizada.mostrar_pedidos_online ??
            true
        );

        setTamanhoLogo(
          configuracaoAtualizada.tamanho_logo ||
            56
        );

        setTamanhoIcone(
          configuracaoAtualizada.tamanho_icone ||
            64
        );

        setEstiloCards(
          configuracaoAtualizada.estilo_cards ||
            "arredondado"
        );
      }

      setMensagem(
        "Configuração salva com sucesso! 🔥"
      );
    } catch (error) {
      console.error(
        "Erro inesperado ao salvar:",
        error
      );

      setMensagem(
        error instanceof Error
          ? `Erro: ${error.message}`
          : "Erro inesperado ao salvar."
      );
    } finally {
      setSalvando(false);
    }
  }

  // =========================
  // SAIR
  // =========================

  async function sair() {
    await supabase.auth.signOut();

    router.replace(
      "/login?next=/config"
    );
  }

  // =========================
  // ESTILOS
  // =========================

  const radius =
    estiloCards === "arredondado"
      ? "28px"
      : estiloCards === "medio"
      ? "16px"
      : "4px";

  const cardRadius =
    estiloCards === "arredondado"
      ? "20px"
      : estiloCards === "medio"
      ? "12px"
      : "4px";

  // =========================
  // VERIFICANDO LOGIN
  // =========================

  if (verificandoLogin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow">
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
  // CONFIGURAÇÃO
  // =========================

  return (
    <main
      className="min-h-screen p-5"
      style={{
        backgroundColor: corFundo,
      }}
    >
      <div className="mx-auto max-w-5xl">

        {/* CABEÇALHO */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div>
            <p
              className="text-sm font-bold uppercase tracking-widest"
              style={{
                color: corPrincipal,
              }}
            >
              JM GÁS
            </p>

            <h1 className="mt-1 text-4xl font-black text-zinc-950">
              Personalização
            </h1>

            <p className="mt-2 text-zinc-500">
              Controle a aparência da página do cliente.
            </p>
          </div>

          <button
            type="button"
            onClick={sair}
            className="w-fit rounded-xl bg-zinc-200 px-4 py-2 text-sm font-bold text-zinc-700 transition hover:bg-zinc-300"
          >
            Sair
          </button>

        </div>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* CONFIGURAÇÕES */}

          <div className="space-y-6">

            {/* GERAL */}

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">

              <h2 className="mb-5 text-xl font-black">
                ⚙️ Geral
              </h2>

              <label className="mb-2 block text-sm font-bold text-zinc-700">
                Nome da empresa
              </label>

              <input
                value={nomeEmpresa}
                onChange={(e) =>
                  setNomeEmpresa(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-red-500"
              />

              <label className="mb-2 mt-5 block text-sm font-bold text-zinc-700">
                Texto principal
              </label>

              <textarea
                value={textoPrincipal}
                onChange={(e) =>
                  setTextoPrincipal(
                    e.target.value
                  )
                }
                rows={3}
                className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-red-500"
              />

            </section>

            {/* IMAGENS */}

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">

              <h2 className="mb-2 text-xl font-black">
                🖼️ Imagens
              </h2>

              <p className="mb-5 text-sm text-zinc-500">
                Coloque o caminho da imagem que está na pasta
                <b> public </b>
                do projeto.
              </p>

              <label className="mb-2 block text-sm font-bold text-zinc-700">
                Logo
              </label>

              <input
                value={imagemLogo}
                onChange={(e) =>
                  setImagemLogo(
                    e.target.value
                  )
                }
                placeholder="/logo.png"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono outline-none focus:border-red-500"
              />

              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-zinc-100">
                  <Image
                    src={
                      imagemLogo ||
                      "/botijao.jpg"
                    }
                    alt="Logo"
                    width={64}
                    height={64}
                    className="h-full w-full object-contain"
                  />
                </div>

                <span className="text-xs text-zinc-500">
                  Preview da logo
                </span>
              </div>

              <label className="mb-2 mt-6 block text-sm font-bold text-zinc-700">
                Imagem do botijão
              </label>

              <input
                value={imagemGas}
                onChange={(e) =>
                  setImagemGas(
                    e.target.value
                  )
                }
                placeholder="/botijao.jpg"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono outline-none focus:border-red-500"
              />

              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-red-50">
                  <Image
                    src={
                      imagemGas ||
                      "/botijao.jpg"
                    }
                    alt="Botijão"
                    width={64}
                    height={64}
                    className="h-full w-full object-contain"
                  />
                </div>

                <span className="text-xs text-zinc-500">
                  Preview do gás
                </span>
              </div>

              <label className="mb-2 mt-6 block text-sm font-bold text-zinc-700">
                Imagem da água
              </label>

              <input
                value={imagemAgua}
                onChange={(e) =>
                  setImagemAgua(
                    e.target.value
                  )
                }
                placeholder="/agua.jpg"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono outline-none focus:border-red-500"
              />

              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-blue-50">
                  <Image
                    src={
                      imagemAgua ||
                      "/agua.jpg"
                    }
                    alt="Água"
                    width={64}
                    height={64}
                    className="h-full w-full object-contain"
                  />
                </div>

                <span className="text-xs text-zinc-500">
                  Preview da água
                </span>
              </div>

            </section>

            {/* FAIXA */}

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">

              <h2 className="mb-5 text-xl font-black">
                🖥️ Faixa superior
              </h2>

              <label className="mb-2 block text-sm font-bold text-zinc-700">
                Cor da faixa
              </label>

              <div className="flex gap-3">
                <input
                  type="color"
                  value={corCabecalho}
                  onChange={(e) =>
                    setCorCabecalho(
                      e.target.value
                    )
                  }
                  className="h-12 w-16 cursor-pointer rounded-xl border-0"
                />

                <input
                  value={corCabecalho}
                  onChange={(e) =>
                    setCorCabecalho(
                      e.target.value
                    )
                  }
                  className="flex-1 rounded-xl border border-zinc-200 px-4 font-mono uppercase"
                />
              </div>

              <label className="mb-2 mt-5 block text-sm font-bold text-zinc-700">
                Cor da fonte da faixa
              </label>

              <div className="flex gap-3">
                <input
                  type="color"
                  value={corFonteCabecalho}
                  onChange={(e) =>
                    setCorFonteCabecalho(
                      e.target.value
                    )
                  }
                  className="h-12 w-16 cursor-pointer rounded-xl border-0"
                />

                <input
                  value={corFonteCabecalho}
                  onChange={(e) =>
                    setCorFonteCabecalho(
                      e.target.value
                    )
                  }
                  className="flex-1 rounded-xl border border-zinc-200 px-4 font-mono uppercase"
                />
              </div>

              <label className="mb-2 mt-5 block text-sm font-bold text-zinc-700">
                Texto abaixo do nome
              </label>

              <input
                value={subtituloCabecalho}
                onChange={(e) =>
                  setSubtituloCabecalho(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-red-500"
              />

              <label className="mt-5 flex cursor-pointer items-center justify-between rounded-xl bg-zinc-50 p-4">
                <div>
                  <p className="font-bold text-zinc-900">
                    Mostrar "PEDIDOS ONLINE"
                  </p>

                  <p className="text-xs text-zinc-500">
                    Texto no canto da faixa
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={mostrarPedidos}
                  onChange={(e) =>
                    setMostrarPedidos(
                      e.target.checked
                    )
                  }
                  className="h-5 w-5"
                />
              </label>

              <div className="mt-5">
                <div className="mb-2 flex justify-between">
                  <label className="text-sm font-bold text-zinc-700">
                    Tamanho da logo
                  </label>

                  <span className="text-sm font-bold text-zinc-500">
                    {tamanhoLogo}px
                  </span>
                </div>

                <input
                  type="range"
                  min="40"
                  max="100"
                  value={tamanhoLogo}
                  onChange={(e) =>
                    setTamanhoLogo(
                      Number(e.target.value)
                    )
                  }
                  className="w-full"
                />
              </div>

            </section>

            {/* ÍCONES */}

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">

              <h2 className="mb-2 text-xl font-black">
                📦 Ícones dos produtos
              </h2>

              <p className="mb-5 text-sm text-zinc-500">
                As imagens acima aparecem aqui automaticamente.
              </p>

              <div className="grid grid-cols-2 gap-3">

                <div className="rounded-2xl bg-red-50 p-4">
                  <div
                    className="mx-auto flex items-center justify-center overflow-hidden rounded-xl bg-white"
                    style={{
                      width: tamanhoIcone,
                      height: tamanhoIcone,
                    }}
                  >
                    <Image
                      src={
                        imagemGas ||
                        "/botijao.jpg"
                      }
                      alt="Gás"
                      width={100}
                      height={100}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <p className="mt-3 text-center font-black">
                    Gás
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-50 p-4">
                  <div
                    className="mx-auto flex items-center justify-center overflow-hidden rounded-xl bg-white"
                    style={{
                      width: tamanhoIcone,
                      height: tamanhoIcone,
                    }}
                  >
                    <Image
                      src={
                        imagemAgua ||
                        "/agua.jpg"
                      }
                      alt="Água"
                      width={100}
                      height={100}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <p className="mt-3 text-center font-black">
                    Água
                  </p>
                </div>

              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between">
                  <label className="text-sm font-bold text-zinc-700">
                    Tamanho dos ícones
                  </label>

                  <span className="text-sm font-bold text-zinc-500">
                    {tamanhoIcone}px
                  </span>
                </div>

                <input
                  type="range"
                  min="40"
                  max="120"
                  value={tamanhoIcone}
                  onChange={(e) =>
                    setTamanhoIcone(
                      Number(e.target.value)
                    )
                  }
                  className="w-full"
                />
              </div>

            </section>

            {/* CORES */}

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">

              <h2 className="mb-5 text-xl font-black">
                🎨 Cores
              </h2>

              <div className="grid grid-cols-3 gap-3">

                <div>
                  <label className="mb-2 block text-xs font-bold text-zinc-500">
                    Principal
                  </label>

                  <input
                    type="color"
                    value={corPrincipal}
                    onChange={(e) =>
                      setCorPrincipal(
                        e.target.value
                      )
                    }
                    className="h-12 w-full cursor-pointer rounded-xl border-0"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-zinc-500">
                    Fundo
                  </label>

                  <input
                    type="color"
                    value={corFundo}
                    onChange={(e) =>
                      setCorFundo(
                        e.target.value
                      )
                    }
                    className="h-12 w-full cursor-pointer rounded-xl border-0"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-zinc-500">
                    Cards
                  </label>

                  <input
                    type="color"
                    value={corCard}
                    onChange={(e) =>
                      setCorCard(
                        e.target.value
                      )
                    }
                    className="h-12 w-full cursor-pointer rounded-xl border-0"
                  />
                </div>

              </div>

            </section>

            {/* ESTILO */}

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">

              <h2 className="mb-4 text-xl font-black">
                🧱 Estilo
              </h2>

              <div className="grid grid-cols-3 gap-2">

                {[
                  ["arredondado", "Arredondado"],
                  ["medio", "Médio"],
                  ["quadrado", "Quadrado"],
                ].map(([valor, nome]) => (
                  <button
                    key={valor}
                    type="button"
                    onClick={() =>
                      setEstiloCards(valor)
                    }
                    className={`border-2 p-3 text-sm font-bold ${
                      estiloCards === valor
                        ? "border-red-600 bg-red-50 text-red-600"
                        : "border-zinc-200 text-zinc-600"
                    }`}
                    style={{
                      borderRadius:
                        valor ===
                        "arredondado"
                          ? "16px"
                          : valor === "medio"
                          ? "10px"
                          : "3px",
                    }}
                  >
                    {nome}
                  </button>
                ))}

              </div>

            </section>

            {/* SALVAR */}

            <button
              type="button"
              onClick={
                salvarConfiguracao
              }
              disabled={salvando}
              className="w-full rounded-2xl bg-zinc-950 px-5 py-5 text-lg font-black text-white shadow-lg transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {salvando
                ? "SALVANDO..."
                : "💾 SALVAR CONFIGURAÇÃO"}
            </button>

            {mensagem && (
              <div className="rounded-2xl bg-zinc-900 p-4 text-center font-bold text-white">
                {mensagem}
              </div>
            )}

          </div>

          {/* PREVIEW */}

          <div className="lg:sticky lg:top-5 lg:self-start">

            <p className="mb-3 text-sm font-bold text-zinc-500">
              PRÉ-VISUALIZAÇÃO
            </p>

            <div
              className="overflow-hidden shadow-2xl"
              style={{
                backgroundColor:
                  corFundo,
                borderRadius:
                  radius,
              }}
            >

              {/* FAIXA */}

              <div
                className="p-5"
                style={{
                  backgroundColor:
                    corCabecalho,
                  color:
                    corFonteCabecalho,
                }}
              >

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div
                      className="flex items-center justify-center overflow-hidden rounded-xl bg-white"
                      style={{
                        width:
                          tamanhoLogo,
                        height:
                          tamanhoLogo,
                      }}
                    >
                      <Image
                        src={
                          imagemLogo ||
                          "/botijao.jpg"
                        }
                        alt="Logo"
                        width={100}
                        height={100}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div>
                      <h2
                        className="text-xl font-black"
                        style={{
                          color:
                            corFonteCabecalho,
                        }}
                      >
                        {nomeEmpresa ||
                          "JM GÁS"}
                      </h2>

                      <p
                        className="text-xs opacity-70"
                        style={{
                          color:
                            corFonteCabecalho,
                        }}
                      >
                        {subtituloCabecalho}
                      </p>
                    </div>

                  </div>

                  {mostrarPedidos && (
                    <span
                      className="hidden rounded-lg border px-2 py-2 text-[9px] font-bold sm:block"
                      style={{
                        borderColor:
                          corFonteCabecalho,
                        color:
                          corFonteCabecalho,
                      }}
                    >
                      PEDIDOS ONLINE
                    </span>
                  )}

                </div>

              </div>

              {/* CONTEÚDO */}

              <div className="p-5">

                <p
                  className="text-xs font-black uppercase tracking-wider"
                  style={{
                    color:
                      corPrincipal,
                  }}
                >
                  Pedido rápido
                </p>

                <h3 className="mt-2 text-3xl font-black text-zinc-950">
                  Faça seu pedido
                </h3>

                <p className="mt-2 text-sm text-zinc-500">
                  {textoPrincipal}
                </p>

                {/* GÁS */}

                <div
                  className="mt-6 p-4 shadow-sm"
                  style={{
                    backgroundColor:
                      corCard,
                    borderRadius:
                      cardRadius,
                  }}
                >

                  <div className="flex items-center gap-3">

                    <div
                      className="flex items-center justify-center overflow-hidden rounded-xl bg-red-50"
                      style={{
                        width:
                          tamanhoIcone,
                        height:
                          tamanhoIcone,
                      }}
                    >
                      <Image
                        src={
                          imagemGas ||
                          "/botijao.jpg"
                        }
                        alt="Gás"
                        width={100}
                        height={100}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div>
                      <p className="font-black">
                        Botijão de cozinha
                      </p>

                      <p className="text-xs text-zinc-500">
                        Gás de cozinha
                      </p>
                    </div>

                  </div>

                </div>

                {/* ÁGUA */}

                <div
                  className="mt-3 p-4 shadow-sm"
                  style={{
                    backgroundColor:
                      corCard,
                    borderRadius:
                      cardRadius,
                  }}
                >

                  <div className="flex items-center gap-3">

                    <div
                      className="flex items-center justify-center overflow-hidden rounded-xl bg-blue-50"
                      style={{
                        width:
                          tamanhoIcone,
                        height:
                          tamanhoIcone,
                      }}
                    >
                      <Image
                        src={
                          imagemAgua ||
                          "/agua.jpg"
                        }
                        alt="Água"
                        width={100}
                        height={100}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div>
                      <p className="font-black">
                        Água
                      </p>

                      <p className="text-xs text-zinc-500">
                        Água para sua casa
                      </p>
                    </div>

                  </div>

                </div>

                <button
                  type="button"
                  className="mt-5 w-full rounded-xl px-5 py-4 font-black text-white"
                  style={{
                    backgroundColor:
                      corPrincipal,
                  }}
                >
                  🔥 FAZER PEDIDO
                </button>

              </div>

            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
