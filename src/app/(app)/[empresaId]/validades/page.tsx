import { prisma } from '@/lib/prisma';
import { statusValidade, diasParaVencer } from '@/lib/business';

const TAG: Record<string, string> = { ok: 'Normal', warn: 'Atenção', danger: 'Vencido' };

export default async function ValidadesPage({ params }: { params: { empresaId: string } }) {
  const estoques = await prisma.estoque.findMany({
    where: { empresaId: params.empresaId, quantidadeTb: { gt: 0 }, validade: { not: null } },
    include: { produto: true }
  });

  const ordenados = estoques
    .map((e) => ({ ...e, dias: diasParaVencer(e.validade) ?? 999999 }))
    .sort((a, b) => a.dias - b.dias);

  const vencidos = ordenados.filter((e) => e.dias < 0).length;
  const em30 = ordenados.filter((e) => e.dias >= 0 && e.dias <= 30).length;
  const em90 = ordenados.filter((e) => e.dias > 30 && e.dias <= 90).length;

  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="page-title">Validades</div>
          <div className="page-sub">Lotes por proximidade de vencimento</div>
        </div>
      </div>

      <div className="metrics">
        <div className="metric warn">
          <div className="lbl">Vencidos</div>
          <div className="val">{vencidos}</div>
        </div>
        <div className="metric warn">
          <div className="lbl">Vencem em 30d</div>
          <div className="val">{em30}</div>
        </div>
        <div className="metric">
          <div className="lbl">Vencem em 90d</div>
          <div className="val">{em90}</div>
        </div>
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Lote</th>
                <th>Endereço</th>
                <th>Qtd (TB)</th>
                <th>Validade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ordenados.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty">
                    Nenhum lote com validade cadastrada.
                  </td>
                </tr>
              )}
              {ordenados.map((e) => {
                const status = statusValidade(e.validade);
                return (
                  <tr key={e.id}>
                    <td className="code">{e.produto.sku}</td>
                    <td className="code">{e.lote}</td>
                    <td className="code">
                      {e.bloco}·{e.rua}·{e.face}
                    </td>
                    <td>{e.quantidadeTb}</td>
                    <td className="code">{e.validade!.toLocaleDateString('pt-BR')}</td>
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
