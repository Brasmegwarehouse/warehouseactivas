'use server';

import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { exigirAcessoEmpresa } from '@/lib/tenant';

export async function criarUsuarioNaEmpresa(empresaId: string, formData: FormData) {
  const { perfil: perfilDoAdmin } = await exigirAcessoEmpresa(empresaId);
  if (perfilDoAdmin !== 'ADMIN' && perfilDoAdmin !== 'GESTOR') {
    throw new Error('Apenas administradores ou gestores podem adicionar usuários.');
  }

  const nome = String(formData.get('nome') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const perfil = String(formData.get('perfil') || 'OPERADOR') as 'ADMIN' | 'GESTOR' | 'OPERADOR';
  const senhaProvisoria = String(formData.get('senha') || '');

  if (!nome || !email || senhaProvisoria.length < 6) {
    throw new Error('Nome, e-mail e senha (mín. 6 caracteres) são obrigatórios.');
  }

  const senhaHash = await bcrypt.hash(senhaProvisoria, 10);

  const usuario = await prisma.usuario.upsert({
    where: { email },
    update: {},
    create: { nome, email, senhaHash }
  });

  await prisma.usuarioEmpresa.upsert({
    where: { usuarioId_empresaId: { usuarioId: usuario.id, empresaId } },
    update: { perfil },
    create: { usuarioId: usuario.id, empresaId, perfil }
  });

  revalidatePath(`/${empresaId}/usuarios`);
}
