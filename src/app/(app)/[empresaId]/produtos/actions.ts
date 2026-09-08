'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { exigirAcessoEmpresa } from '@/lib/tenant';

export async function criarProduto(empresaId: string, formData: FormData) {
  await exigirAcessoEmpresa(empresaId);

  const sku = String(formData.get('sku') || '').trim();
  const descricao = String(formData.get('descricao') || '').trim();
  const familia = String(formData.get('familia') || '').trim() || null;
  const embalagem = String(formData.get('embalagem') || 'Tambor metálico');
  const capacidadeL = Number(formData.get('capacidadeL') || 0) || null;
  const tbPorPallet = Number(formData.get('tbPorPallet') || 4);

  if (!sku || !descricao) {
    throw new Error('SKU e descrição são obrigatórios.');
  }

  await prisma.produto.create({
    data: { empresaId, sku, descricao, familia, embalagem, capacidadeL, tbPorPallet }
  });

  revalidatePath(`/${empresaId}/produtos`);
}
