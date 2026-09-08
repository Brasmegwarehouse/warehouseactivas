import { prisma } from '@/lib/prisma';

export default async function HistoricoPage({ params }: { params: { empresaId: string } }) {
  const historico = await prisma.historico.findMany({
    where: { empresaId: params.empresaId },
    include: { produto: true },
    orderBy: { criadoEm: 'desc' },
    take: 200
  });

  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="page-title">Histórico</div>
          <div className="page-sub">Todas as movimentações registradas</div>
        </div>
      </div>
      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Tipo</th>
                <th>SKU</th>
                <th>Lote</th>
                <th>De</th>
                <th>Para</th>
                <th>TB</th>
                <th>Operador</th>
              </tr>
            </thead>
            <tbody>
              {historico.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty">
                    Nenhuma movimentação registrada ainda.
                  </td>
                </tr>
              )}
              {historico.map((h) => (
                <tr key={h.id}>
                  <td className="code">{h.criadoEm.toLocaleString('pt-BR')}</td>
                  <td>{h.tipo}</td>
                  <td className="code">{h.produto.sku}</td>
                  <td className="code">{h.lote}</td>
                  <td className="code">{h.origem ?? '—'}</td>
                  <td className="code">{h.destino ?? '—'}</td>
                  <td>{h.quantidadeTb}</td>
                  <td>{h.operador}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
