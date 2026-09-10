'use client';

import { useMemo, useState } from 'react';

type Produto = { id: string; sku: string; descricao: string; tbPorPallet: number };
type EstoqueItem = {
  id: string;
  lote: string;
  quantidadeTb: number;
  bloco: string;
  rua: string;
  face: string;
  produtoId: string;
  produto: { sku: string };
};

export default function MovimentacaoTabs({
  produtos,
  estoques,
  entradaAction,
  transferenciaAction,
  saidaAction
}: {
  produtos: Produto[];
  estoques: EstoqueItem[];
  entradaAction: (formData: FormData) => Promise<void>;
  transferenciaAction: (formData: FormData) => Promise<void>;
  saidaAction: (formData: FormData) => Promise<void>;
}) {
  const [tab, setTab] = useState<'entrada' | 'transferencia' | 'saida'>('entrada');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Produto selecionado em cada aba, só pra filtrar a lista de lotes — não é enviado no form.
  const [produtoTransfId, setProdutoTransfId] = useState('');
  const [produtoSaidaId, setProdutoSaidaId] = useState('');

  // Lista de produtos que têm estoque disponível, sem repetir.
  const produtosComEstoque = useMemo(() => {
    const mapa = new Map<string, { id: string; sku: string }>();
    for (const e of estoques) {
      if (!mapa.has(e.produtoId)) mapa.set(e.produtoId, { id: e.produtoId, sku: e.produto.sku });
    }
    return Array.from(mapa.values()).sort((a, b) => a.sku.localeCompare(b.sku));
  }, [estoques]);

  const lotesTransferencia = useMemo(
    () => estoques.filter((e) => !produtoTransfId || e.produtoId === produtoTransfId),
    [estoques, produtoTransfId]
  );
  const lotesSaida = useMemo(
    () => estoques.filter((e) => !produtoSaidaId || e.produtoId === produtoSaidaId),
    [estoques, produtoSaidaId]
  );

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
    action: (fd: FormData) => Promise<void>
  ) {
    e.preventDefault();
    if (enviando) return; // evita clique duplo enviar duas vezes

    const form = e.currentTarget;
    const fd = new FormData(form);

    setErro('');
    setSucesso('');
    setEnviando(true);
    try {
      await action(fd);
      setSucesso('Confirmado! Movimentação registrada com sucesso.');
      form.reset();
      setProdutoTransfId('');
      setProdutoSaidaId('');
      window.setTimeout(() => setSucesso(''), 4000);
    } catch (e: any) {
      setErro(e?.message || 'Erro ao registrar movimentação.');
    } finally {
      setEnviando(false);
    }
  }

  function trocarTab(novaTab: typeof tab) {
    setTab(novaTab);
    setErro('');
    setSucesso('');
  }

  return (
    <div className="card">
      <div className="seg">
        <button className={tab === 'entrada' ? 'active' : ''} onClick={() => trocarTab('entrada')} type="button">
          Entrada
        </button>
        <button
          className={tab === 'transferencia' ? 'active' : ''}
          onClick={() => trocarTab('transferencia')}
          type="button"
        >
          Transferência
        </button>
        <button className={tab === 'saida' ? 'active' : ''} onClick={() => trocarTab('saida')} type="button">
          Saída
        </button>
      </div>

      {erro && (
        <div
          className="info-strip"
          style={{ color: 'var(--red)', background: 'var(--red-soft)', borderColor: 'var(--red)' }}
        >
          {erro}
        </div>
      )}

      {sucesso && (
        <div
          className="info-strip"
          style={{ color: 'var(--teal)', background: 'var(--teal-soft)', borderColor: 'var(--teal)' }}
        >
          ✓ {sucesso}
        </div>
      )}

      {tab === 'entrada' && (
        <form onSubmit={(e) => handleSubmit(e, entradaAction)}>
          <div className="form-grid g2">
            <div className="field">
              <label>Produto / SKU</label>
              <select name="produtoId" required>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.descricao}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Lote</label>
              <input name="lote" placeholder="Ex: L2025-001" required />
            </div>
          </div>
          <div className="form-grid g4">
            <div className="field">
              <label>Dt. fabricação</label>
              <input name="dataFabricacao" type="date" />
            </div>
            <div className="field">
              <label>Validade</label>
              <input name="validade" type="date" />
            </div>
            <div className="field">
              <label>Quantidade (unidade)</label>
              <input name="quantidadeTb" type="number" placeholder="0" required />
            </div>
            <div className="field">
              <label>Observação</label>
              <input name="observacao" placeholder="Opcional" />
            </div>
          </div>
          <div className="form-grid g3">
            <div className="field">
              <label>Bloco</label>
              <select name="bloco">
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
                <option>Lonado</option>
                <option>Doca</option>
              </select>
            </div>
            <div className="field">
              <label>Rua</label>
              <input name="rua" placeholder="01" required />
            </div>
            <div className="field">
              <label>Face</label>
              <input name="face" placeholder="01" required />
            </div>
          </div>
          <div className="btn-row">
            <button className="btn primary" type="submit" disabled={enviando}>
              {enviando ? 'Confirmando…' : 'Confirmar entrada'}
            </button>
          </div>
        </form>
      )}

      {tab === 'transferencia' && (
        <form onSubmit={(e) => handleSubmit(e, transferenciaAction)}>
          <div className="form-grid g2">
            <div className="field">
              <label>Produto / SKU</label>
              <select
                value={produtoTransfId}
                onChange={(e) => setProdutoTransfId(e.target.value)}
              >
                <option value="">Todos os produtos</option>
                {produtosComEstoque.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Lote em estoque (origem)</label>
              <select name="estoqueOrigemId" required key={produtoTransfId}>
                {lotesTransferencia.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.lote} · {e.bloco}·{e.rua}·{e.face} ({e.quantidadeTb} un.)
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-grid g2">
            <div className="field">
              <label>Quantidade (unidade)</label>
              <input name="quantidadeTb" type="number" placeholder="0" required />
            </div>
          </div>
          <div className="form-grid g3">
            <div className="field">
              <label>Bloco destino</label>
              <select name="blocoDestino">
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
              </select>
            </div>
            <div className="field">
              <label>Rua destino</label>
              <input name="ruaDestino" placeholder="01" required />
            </div>
            <div className="field">
              <label>Face destino</label>
              <input name="faceDestino" placeholder="01" required />
            </div>
          </div>
          <div className="btn-row">
            <button className="btn primary" type="submit" disabled={enviando}>
              {enviando ? 'Confirmando…' : 'Confirmar transferência'}
            </button>
          </div>
        </form>
      )}

      {tab === 'saida' && (
        <form onSubmit={(e) => handleSubmit(e, saidaAction)}>
          <div className="form-grid g3">
            <div className="field">
              <label>Produto / SKU</label>
              <select value={produtoSaidaId} onChange={(e) => setProdutoSaidaId(e.target.value)}>
                <option value="">Todos os produtos</option>
                {produtosComEstoque.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Lote em estoque</label>
              <select name="estoqueId" required key={produtoSaidaId}>
                {lotesSaida.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.lote} · {e.bloco}·{e.rua}·{e.face} ({e.quantidadeTb} un.)
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Quantidade (unidade)</label>
              <input name="quantidadeTb" type="number" placeholder="0" required />
            </div>
          </div>
          <div className="field">
            <label>Observação / NF</label>
            <input name="observacao" placeholder="NF 123456" />
          </div>
          <div className="btn-row">
            <button className="btn primary" type="submit" disabled={enviando}>
              {enviando ? 'Confirmando…' : 'Confirmar saída'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
