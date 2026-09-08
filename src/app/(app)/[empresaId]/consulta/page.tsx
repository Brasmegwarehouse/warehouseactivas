import { prisma } from '@/lib/prisma';
import { statusValidade } from '@/lib/business';

const TAG: Record<string, string> = { ok: 'Normal', warn: 'Atenção', danger: 'Vencido' };

export default async function ConsultaPage({ params }: { params: { empresaId: string } }) {
  const estoques = await prisma.estoque.findMany({
    where: { empresaId: params.empresaId, quantidadeTb: { gt: 0 } },
    include: { produto: true },
    orderBy: { criadoEm: 'desc' }
  });

  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="page-title">Consulta de estoque</div>
          <div className="page-sub">Posição atual por SKU, lote e endereço</div>
        </div>
      </div>
      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>SKU</th>
                <th>Lote</th>
                <th>Validade</th>
                <th>Endereço</th>
                <th>Qtd (TB)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {estoques.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty">
                    Nenhum estoque em posição.
                  </td>
                </tr>
              )}
              {estoques.map((e) => {
                const status = statusValidade(e.validade);
                return (
                  <tr key={e.id}>
                    <td>{e.produto.descricao}</td>
                    <td className="code">{e.produto.sku}</td>
                    <td className="code">{e.lote}</td>
                    <td className="code">{e.validade ? e.validade.toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="code">
                      {e.bloco}·{e.rua}·{e.face}
                    </td>
                    <td>{e.quantidadeTb}</td>
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
    </div>
  );
}
