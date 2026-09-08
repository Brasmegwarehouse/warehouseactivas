import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';
import { prisma } from './prisma';

export async function getUsuarioLogado() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  return session.user as { id: string; name: string; email: string };
}

export async function getEmpresasDoUsuario(usuarioId: string) {
  return prisma.usuarioEmpresa.findMany({
    where: { usuario: { id: usuarioId } },
    include: { empresa: true }
  });
}

// Garante que o usuário logado tem acesso à empresa da URL; senão, manda de volta
// para a seleção de empresa. Retorna o perfil de acesso junto (para checar permissões).
export async function exigirAcessoEmpresa(empresaId: string) {
  const usuario = await getUsuarioLogado();
  const acesso = await prisma.usuarioEmpresa.findFirst({
    where: { usuarioId: usuario.id, empresaId },
    include: { empresa: true }
  });
  if (!acesso) redirect('/empresas');
  return { usuario, empresa: acesso.empresa, perfil: acesso.perfil };
}
