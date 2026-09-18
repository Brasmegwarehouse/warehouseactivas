import { prisma } from '@/lib/prisma';
import { statusValidade } from '@/lib/business';
import ConsultaTable from './ConsultaTable';

export default async function ConsultaPage({ params }: { params: { empresaId: string } }) {
  const estoques = await prisma.estoque.findMany({
    where: { empresaId: params.empresaId, quantidadeTb: { gt: 0 } },
    include: { produto: true },
    orderBy: { criadoEm: 'desc' }
  });

  const statusOf: Record<string, string> = {};
  for (const e of estoques) {
    statusOf[e.id] = statusValidade(e.validade);
  }

  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="page-title">Consulta de estoque</div>
          <div className="page-sub">Posição atual por SKU, lote e endereço</div>
        </div>
      </div>
      <ConsultaTable estoques={estoques} statusOf={statusOf} />
    </div>
  );
}
