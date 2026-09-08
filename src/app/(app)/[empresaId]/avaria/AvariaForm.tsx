'use client';

import { useState } from 'react';

type EstoqueItem = {
  id: string;
  lote: string;
  quantidadeTb: number;
  bloco: string;
  rua: string;
  face: string;
  produto: { sku: string };
};

export default function AvariaForm({
  estoques,
  action
}: {
  estoques: EstoqueItem[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [erro, setErro] = useState('');

  async function handle(fd: FormData) {
    setErro('');
    try {
      await action(fd);
    } catch (e: any) {
      setErro(e?.message || 'Erro ao registrar avaria.');
    }
  }

  return (
    <div className="card">
      {erro && (
        <div
          className="info-strip"
          style={{ color: 'var(--red)', background: 'var(--red-soft)', borderColor: 'var(--red)' }}
        >
          {erro}
        </div>
      )}
      <form action={handle}>
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
            <label>Causa</label>
            <select name="causa" required>
              <option>Vazamento / derramamento</option>
              <option>Tambor amassado</option>
              <option>Corrosão</option>
              <option>Contaminação</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>Observação</label>
          <input name="observacao" placeholder="Detalhes da avaria..." />
        </div>
        <div className="btn-row">
          <button className="btn primary" type="submit">
            Registrar avaria
          </button>
        </div>
      </form>
    </div>
  );
}
