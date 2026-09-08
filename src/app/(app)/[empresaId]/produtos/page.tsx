import { prisma } from '@/lib/prisma';
import { criarProduto } from './actions';

export default async function ProdutosPage({ params }: { params: { empresaId: string } }) {
  const { empresaId } = params;
  const produtos = await prisma.produto.findMany({
    where: { empresaId },
    orderBy: { criadoEm: 'desc' }
  });

  const criarProdutoComEmpresa = criarProduto.bind(null, empresaId);

  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="page-title">Produtos</div>
          <div className="page-sub">Cadastro de SKUs, embalagens e cubagem</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Novo produto</div>
        <form action={criarProdutoComEmpresa}>
          <div className="form-grid g3">
            <div className="field">
              <label>SKU</label>
              <input name="sku" placeholder="Ex: CITROSUCO-001" required />
            </div>
            <div className="field">
              <label>Descrição</label>
              <input name="descricao" placeholder="Ex: Óleo essencial laranja" required />
            </div>
            <div className="field">
              <label>Família</label>
              <input name="familia" placeholder="Ex: Suco, Óleo" />
            </div>
          </div>
          <div className="form-grid g3">
            <div className="field">
              <label>Embalagem</label>
              <select name="embalagem" defaultValue="Tambor metálico">
                <option>Tambor metálico</option>
                <option>IBC / Tote</option>
                <option>Bag / Big Bag</option>
              </select>
            </div>
            <div className="field">
              <label>Capacidade (L)</label>
              <input name="capacidadeL" type="number" placeholder="200" />
            </div>
            <div className="field">
              <label>TB por pallet</label>
              <input name="tbPorPallet" type="number" defaultValue={4} />
            </div>
          </div>
          <div className="btn-row">
            <button className="btn primary" type="submit">
              Salvar produto
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-title">Produtos cadastrados</div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Descrição</th>
                <th>Embalagem</th>
                <th>TB/Pallet</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {produtos.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty">
                    Nenhum produto cadastrado ainda.
                  </td>
                </tr>
              )}
              {produtos.map((p) => (
                <tr key={p.id}>
                  <td className="code">{p.sku}</td>
                  <td>{p.descricao}</td>
                  <td>{p.embalagem}</td>
                  <td>{p.tbPorPallet}</td>
                  <td>
                    <span className={`tag ${p.ativo ? 'ok' : 'danger'}`}>
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
