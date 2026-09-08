import { prisma } from '@/lib/prisma';
import AvariaForm from './AvariaForm';
import { registrarAvaria } from './actions';

export default async function AvariaPage({ params }: { params: { empresaId: string } }) {
  const { empresaId } = params;
  const estoques = await prisma.estoque.findMany({
    where: { empresaId, quantidadeTb: { gt: 0 } },
    include: { produto: true },
    orderBy: { criadoEm: 'desc' }
  });

  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="page-title">Registrar avaria</div>
          <div className="page-sub">Baixa por avaria com causa e rastreabilidade</div>
        </div>
      </div>
      {estoques.length === 0 ? (
        <div className="card">
          <div className="empty">Nenhum estoque disponível para registrar avaria.</div>
        </div>
      ) : (
        <AvariaForm estoques={estoques} action={registrarAvaria.bind(null, empresaId)} />
      )}
    </div>
  );
}
