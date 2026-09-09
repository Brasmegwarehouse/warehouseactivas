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
  const [sucesso, setSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (enviando) return;

    const form = e.currentTarget;
    const fd = new FormData(form);

    setErro('');
    setSucesso('');
    setEnviando(true);
    try {
      await action(fd);
      setSucesso('Confirmado! Avaria registrada com sucesso.');
      form.reset();
      window.setTimeout(() => setSucesso(''), 4000);
    } catch (e: any) {
      setErro(e?.message || 'Erro ao registrar avaria.');
    } finally {
      setEnviando(false);
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

      {sucesso && (
        <div
          className="info-strip"
          style={{ color: 'var(--teal)', background: 'var(--teal-soft)', borderColor: 'var(--teal)' }}
        >
          ✓ {sucesso}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid g3">
          <div className="field">
            <label>Lote em estoque</label>
            <select name="estoqueId" required>
              {estoques.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.produto.sku} · {e.lote} · {e.bloco}·{e.rua}·{e.face} ({e.quantidadeTb} un.)
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Quantidade (unidade)</label>
            <input name="quantidadeTb" type="number" placeholder="0" required />
          </div>
          <div className="field">
            <label>Causa</label>
            <select name="causa" required>
              <option>Vazamento / derramamento</option>
              <option>Tambor amassado</option>
              <option>Corrosão</option>
              <option>Contaminação</option>
              <option>Rasgado / avaria de origem</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>Observação</label>
          <input name="observacao" placeholder="Detalhes da avaria..." />
        </div>
        <div className="btn-row">
          <button className="btn primary" type="submit" disabled={enviando}>
            {enviando ? 'Confirmando…' : 'Registrar avaria'}
          </button>
        </div>
      </form>
    </div>
  );
}
