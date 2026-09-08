import { prisma } from '@/lib/prisma';

export default async function CobrancasPage({ params }: { params: { empresaId: string } }) {
  const { empresaId } = params;
  const [tipos, faturamentos] = await Promise.all([
    prisma.tipoCobranca.findMany({ where: { empresaId } }),
    prisma.faturamento.findMany({ where: { empresaId }, orderBy: { geradoEm: 'desc' } })
  ]);

  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="page-title">Cobrança / Faturamento</div>
          <div className="page-sub">Tipos de cobrança e fechamento mensal</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Tipos de cobrança</div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Unidade</th>
                <th>Valor unitário</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tipos.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty">
                    Nenhum tipo de cobrança cadastrado ainda.
                  </td>
                </tr>
              )}
              {tipos.map((t) => (
                <tr key={t.id}>
                  <td>{t.nome}</td>
                  <td className="code">{t.unidade}</td>
                  <td>
                    {t.valorUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td>
                    <span className={`tag ${t.ativo ? 'ok' : 'danger'}`}>{t.ativo ? 'Ativo' : 'Inativo'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Faturamentos gerados</div>
        {faturamentos.length === 0 ? (
          <div className="empty">Nenhum fechamento gerado ainda.</div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Valor total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {faturamentos.map((f) => (
                  <tr key={f.id}>
                    <td>{f.periodo}</td>
                    <td>{f.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td>
                      <span className={`tag ${f.status === 'FECHADO' ? 'ok' : 'warn'}`}>{f.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
