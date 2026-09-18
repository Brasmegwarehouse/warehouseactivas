'use client';

import { useMemo, useState } from 'react';

type EstoqueItem = {
  id: string;
  lote: string;
  validade: Date | null;
  bloco: string;
  rua: string;
  face: string;
  quantidadeTb: number;
  produto: { sku: string; descricao: string; unidadeMedida: string };
};

const TAG: Record<string, string> = { ok: 'Normal', warn: 'Atenção', danger: 'Vencido' };

function normalizar(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function ConsultaTable({
  estoques,
  statusOf
}: {
  estoques: EstoqueItem[];
  statusOf: Record<string, string>;
}) {
  const [busca, setBusca] = useState('');

  const filtrados = useMemo(() => {
    const buscaNorm = normalizar(busca.trim());
    if (!buscaNorm) return estoques;
    return estoques.filter((e) => {
      const alvo = normalizar(`${e.lote} ${e.produto.sku} ${e.produto.descricao}`);
      return alvo.includes(buscaNorm);
    });
  }, [estoques, busca]);

  return (
    <div className="card">
      <div className="search-row">
        <input
          type="text"
          inputMode="search"
          placeholder="Buscar por lote, SKU ou descrição..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>
      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>SKU</th>
              <th>Lote</th>
              <th>Validade</th>
              <th>Endereço</th>
              <th>Qtd</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={7} className="empty">
                  {busca ? 'Nenhum lote encontrado para essa busca.' : 'Nenhum estoque em posição.'}
                </td>
              </tr>
            )}
            {filtrados.map((e) => {
              const status = statusOf[e.id];
              return (
                <tr key={e.id}>
                  <td>{e.produto.descricao}</td>
                  <td className="code">{e.produto.sku}</td>
                  <td className="code">{e.lote}</td>
                  <td className="code">{e.validade ? new Date(e.validade).toLocaleDateString('pt-BR') : '—'}</td>
                  <td className="code">
                    {e.bloco}·{e.rua}·{e.face}
                  </td>
                  <td>
                    {e.quantidadeTb.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}{' '}
                    {e.produto.unidadeMedida === 'KG' ? 'kg' : 'un.'}
                  </td>
                  <td>
                    <span className={`tag ${status}`}>{TAG[status]}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
