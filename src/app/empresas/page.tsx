import Link from 'next/link';
import { getUsuarioLogado, getEmpresasDoUsuario } from '@/lib/tenant';
import { prisma } from '@/lib/prisma';

export default async function EmpresasPage() {
  const usuario = await getUsuarioLogado();
  const acessos = await getEmpresasDoUsuario(usuario.id);

  const contagens = await Promise.all(
    acessos.map((a) => prisma.produto.count({ where: { empresaId: a.empresaId, ativo: true } }))
  );

  return (
    <div id="view-empresas" style={{ display: 'flex' }}>
      <div className="emp-wrap">
        <div className="eyebrow">Sua conta tem acesso a</div>
        <h2>Selecione a empresa</h2>

        {acessos.length === 0 && (
          <div className="empty">
            Nenhuma empresa vinculada à sua conta ainda. Peça a um administrador para te dar
            acesso.
          </div>
        )}

        {acessos.map((a, i) => (
          <Link key={a.empresaId} href={`/${a.empresaId}/dashboard`} className="emp-item">
            <div className="emp-badge">{a.empresa.nome.slice(0, 2).toUpperCase()}</div>
            <div>
              <div className="name">{a.empresa.nome}</div>
              <div className="meta">{contagens[i]} SKUs ativos</div>
            </div>
            <div className="arrow">→</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
