import { prisma } from '@/lib/prisma';
import MovimentacaoTabs from './MovimentacaoTabs';
import { registrarEntrada, registrarTransferencia, registrarSaida } from './actions';

export default async function MovimentacaoPage({ params }: { params: { empresaId: string } }) {
  const { empresaId } = params;

  const [produtos, estoques] = await Promise.all([
    prisma.produto.findMany({ where: { empresaId, ativo: true }, orderBy: { sku: 'asc' } }),
    prisma.estoque.findMany({
      where: { empresaId, quantidadeTb: { gt: 0 } },
      include: { produto: true },
      orderBy: { criadoEm: 'desc' }
    })
  ]);

  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="page-title">Movimentação</div>
          <div className="page-sub">Entrada, transferência interna ou saída de estoque</div>
        </div>
      </div>

      {produtos.length === 0 ? (
        <div className="card">
          <div className="empty">
            Cadastre pelo menos um produto antes de registrar movimentações.
          </div>
        </div>
      ) : (
        <MovimentacaoTabs
          produtos={produtos}
          estoques={estoques}
          entradaAction={registrarEntrada.bind(null, empresaId)}
          transferenciaAction={registrarTransferencia.bind(null, empresaId)}
          saidaAction={registrarSaida.bind(null, empresaId)}
        />
      )}
    </div>
  );
}
