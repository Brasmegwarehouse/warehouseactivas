'use client';

import { useState } from 'react';

type Produto = { id: string; sku: string; descricao: string; tbPorPallet: number };
type EstoqueItem = {
  id: string;
  lote: string;
  quantidadeTb: number;
  bloco: string;
  rua: string;
  face: string;
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

  async function handle(action: (fd: FormData) => Promise<void>, fd: FormData) {
    setErro('');
    try {
      await action(fd);
    } catch (e: any) {
      setErro(e?.message || 'Erro ao registrar movimentação.');
    }
  }

  return (
    <div className="card">
      <div className="seg">
        <button className={tab === 'entrada' ? 'active' : ''} onClick={() => setTab('entrada')} type="button">
          Entrada
        </button>
        <button
          className={tab === 'transferencia' ? 'active' : ''}
          onClick={() => setTab('transferencia')}
          type="button"
        >
          Transferência
        </button>
        <button className={tab === 'saida' ? 'active' : ''} onClick={() => setTab('saida')} type="button">
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

      {tab === 'entrada' && (
        <form action={(fd) => handle(entradaAction, fd)}>
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
              <label>Quantidade (TB)</label>
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
            <button className="btn primary" type="submit">
              Confirmar entrada
            </button>
          </div>
        </form>
      )}

      {tab === 'transferencia' && (
        <form action={(fd) => handle(transferenciaAction, fd)}>
          <div className="form-grid g2">
            <div className="field">
              <label>Lote em estoque (origem)</label>
              <select name="estoqueOrigemId" required>
                {estoques.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.produto.sku} · {e.lote} · {e.bloco}·{e.rua}·{e.face} ({e.quantidadeTb} TB)
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Quantidade (TB)</label>
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
            <button className="btn primary" type="submit">
              Confirmar transferência
            </button>
          </div>
        </form>
      )}

      {tab === 'saida' && (
        <form action={(fd) => handle(saidaAction, fd)}>
          <div className="form-grid g3">
            <div className="field">
              <label>Lote em estoque</label>
              <select name="estoqueId" required>
                {estoques.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.produto.sku} · {e.lote} · {e.bloco}·{e.rua}·{e.face} ({e.quantidadeTb} TB)
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Quantidade (TB)</label>
              <input name="quantidadeTb" type="number" placeholder="0" required />
            </div>
            <div className="field">
              <label>Observação / NF</label>
              <input name="observacao" placeholder="NF 123456" />
            </div>
          </div>
          <div className="btn-row">
            <button className="btn primary" type="submit">
              Confirmar saída
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
