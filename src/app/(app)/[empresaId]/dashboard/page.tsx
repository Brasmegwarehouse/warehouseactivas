import { prisma } from '@/lib/prisma';
import Rackmap from '@/components/Rackmap';
import { statusValidade, formatarEndereco } from '@/lib/business';

export default async function DashboardPage({ params }: { params: { empresaId: string } }) {
  const empresaId = params.empresaId;

  const [estoques, historico, avariasMes, empresa] = await Promise.all([
    prisma.estoque.findMany({ where: { empresaId }, include: { produto: true } }),
    prisma.historico.findMany({
      where: { empresaId },
      orderBy: { criadoEm: 'desc' },
      take: 6,
      include: { produto: true }
    }),
    prisma.avaria.count({
      where: { empresaId, criadoEm: { gte: new Date(new Date().setDate(1)) } }
    }),
    prisma.empresa.findUnique({ where: { id: empresaId } })
  ]);

  const totalTb = estoques.reduce((s, e) => s + e.quantidadeTb, 0);
  const enderecosOcupados = new Set(estoques.map((e) => formatarEndereco(e.bloco, e.rua, e.face))).size;
  const vencendo30d = estoques.filter((e) => statusValidade(e.validade) === 'warn').length;

  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="page-title">Painel — {empresa?.nome}</div>
          <div className="page-sub">Visão geral da posição de estoque hoje</div>
        </div>
        <div className="sync">
          <span className="dot" />
          Dados ao vivo
        </div>
      </div>

      <div className="metrics">
        <div className="metric">
          <div className="lbl">Estoque total</div>
          <div className="val">{totalTb}</div>
          <div className="unit">tambores</div>
        </div>
        <div className="metric">
          <div className="lbl">Lotes em posição</div>
          <div className="val">{estoques.length}</div>
          <div className="unit">registros</div>
        </div>
        <div className="metric">
          <div className="lbl">Endereços ocupados</div>
          <div className="val">{enderecosOcupados}</div>
          <div className="unit">endereços únicos</div>
        </div>
        <div className="metric warn">
          <div className="lbl">Vencendo em 30d</div>
          <div className="val">{vencendo30d}</div>
          <div className="unit">lotes</div>
        </div>
        <div className="metric warn">
          <div className="lbl">Avarias no mês</div>
          <div className="val">{avariasMes}</div>
          <div className="unit">ocorrências</div>
        </div>
      </div>

      <div className="grid-2col">
        <div className="card">
          <div className="card-title">Últimas movimentações</div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Tipo</th>
                  <th>SKU</th>
                  <th>Lote</th>
                  <th>De → Para</th>
                  <th>TB</th>
                </tr>
              </thead>
              <tbody>
                {historico.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty">
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
                    <td className="code">
                      {h.origem ?? '—'} → {h.destino ?? '—'}
                    </td>
                    <td>{h.quantidadeTb}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-title">
            Mapa do galpão{' '}
            <span style={{ fontWeight: 400, fontSize: 11, color: 'var(--text3)' }}>
              ocupação por bloco
            </span>
          </div>
          <Rackmap cols={12} rows={7} density={0.45} style={{ gridAutoRows: '14px' }} />
        </div>
      </div>
    </div>
  );
}
