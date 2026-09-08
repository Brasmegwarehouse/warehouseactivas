import { exigirAcessoEmpresa } from '@/lib/tenant';
import Sidebar from '@/components/Sidebar';

export default async function EmpresaLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { empresaId: string };
}) {
  const { usuario, empresa, perfil } = await exigirAcessoEmpresa(params.empresaId);

  return (
    <div id="view-app" style={{ display: 'block' }}>
      <div className="shell">
        <Sidebar
          empresaId={empresa.id}
          empresaNome={empresa.nome}
          usuarioNome={usuario.name}
          perfil={perfil}
        />
        <div className="main">{children}</div>
      </div>
    </div>
  );
}
