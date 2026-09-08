import { prisma } from '@/lib/prisma';
import { criarUsuarioNaEmpresa } from './actions';

export default async function UsuariosPage({ params }: { params: { empresaId: string } }) {
  const { empresaId } = params;
  const acessos = await prisma.usuarioEmpresa.findMany({
    where: { empresaId },
    include: { usuario: true }
  });

  const criarUsuarioComEmpresa = criarUsuarioNaEmpresa.bind(null, empresaId);

  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="page-title">Usuários</div>
          <div className="page-sub">Acesso e permissões desta empresa</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Novo usuário</div>
        <form action={criarUsuarioComEmpresa}>
          <div className="form-grid g2">
            <div className="field">
              <label>Nome</label>
              <input name="nome" placeholder="Nome completo" required />
            </div>
            <div className="field">
              <label>E-mail</label>
              <input name="email" type="email" placeholder="usuario@empresa.com" required />
            </div>
          </div>
          <div className="form-grid g2">
            <div className="field">
              <label>Perfil</label>
              <select name="perfil" defaultValue="OPERADOR">
                <option value="ADMIN">Admin</option>
                <option value="GESTOR">Gestor</option>
                <option value="OPERADOR">Operador</option>
              </select>
            </div>
            <div className="field">
              <label>Senha provisória</label>
              <input name="senha" type="password" placeholder="mín. 6 caracteres" required />
            </div>
          </div>
          <div className="btn-row">
            <button className="btn primary" type="submit">
              Salvar usuário
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
              </tr>
            </thead>
            <tbody>
              {acessos.map((a) => (
                <tr key={a.id}>
                  <td>{a.usuario.nome}</td>
                  <td className="code">{a.usuario.email}</td>
                  <td>
                    <span className="tag in">{a.perfil}</span>
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
