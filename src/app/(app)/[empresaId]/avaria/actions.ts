'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { exigirAcessoEmpresa } from '@/lib/tenant';

export async function registrarAvaria(empresaId: string, formData: FormData) {
  const { usuario } = await exigirAcessoEmpresa(empresaId);

  const estoqueId = String(formData.get('estoqueId'));
  const quantidadeTb = Number(formData.get('quantidadeTb') || 0);
  const causa = String(formData.get('causa') || '');
  const observacao = String(formData.get('observacao') || '') || null;

  const registro = await prisma.estoque.findUnique({ where: { id: estoqueId } });
  if (!registro || quantidadeTb <= 0 || quantidadeTb > registro.quantidadeTb) {
    throw new Error('Quantidade inválida para registro de avaria.');
  }

  await prisma.$transaction([
    prisma.estoque.update({
      where: { id: registro.id },
      data: { quantidadeTb: registro.quantidadeTb - quantidadeTb }
    }),
    prisma.avaria.create({
      data: {
        empresaId,
        produtoId: registro.produtoId,
        lote: registro.lote,
        quantidadeTb,
        causa,
        operador: usuario.name,
        observacao
      }
    })
  ]);

  revalidatePath(`/${empresaId}/dashboard`);
  revalidatePath(`/${empresaId}/consulta`);
}
