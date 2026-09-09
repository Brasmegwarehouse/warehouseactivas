'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getUsuarioLogado, usuarioEhAdmin } from '@/lib/tenant';

function gerarSlug(base: string) {
  return base
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function criarEmpresa(formData: FormData) {
  const usuario = await getUsuarioLogado();

  // Trava no servidor: mesmo que alguém chegue nessa action sem passar pela tela,
  // só quem é ADMIN em pelo menos uma empresa pode criar novas empresas.
  const ehAdmin = await usuarioEhAdmin(usuario.id);
  if (!ehAdmin) {
    throw new Error('Apenas administradores podem criar empresas.');
  }

  const nome = String(formData.get('nome') || '').trim();
  const slugInformado = String(formData.get('slug') || '').trim();
  const contatoNome = String(formData.get('contatoNome') || '').trim() || null;
  const contatoEmail = String(formData.get('contatoEmail') || '').trim() || null;

  if (!nome) {
    throw new Error('Informe o nome da empresa.');
  }

  let slug = gerarSlug(slugInformado || nome);
  if (!slug) {
    throw new Error('Não foi possível gerar um identificador válido para essa empresa.');
  }

  // Evita colisão de slug (ex: duas empresas "Filial 1") adicionando um sufixo numérico.
  const existente = await prisma.empresa.findUnique({ where: { slug } });
  if (existente) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const empresa = await prisma.empresa.create({
    data: { nome, slug, contatoNome, contatoEmail }
  });

  // Quem cria a empresa já entra vinculado a ela como ADMIN.
  await prisma.usuarioEmpresa.create({
    data: { usuarioId: usuario.id, empresaId: empresa.id, perfil: 'ADMIN' }
  });

  redirect(`/${empresa.id}/dashboard`);
}
