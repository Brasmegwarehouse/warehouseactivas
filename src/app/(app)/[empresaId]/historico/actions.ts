'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { exigirAcessoEmpresa } from '@/lib/tenant';

// Desfaz o efeito de um lançamento no estoque e apaga o registro do histórico.
// Só é permitido quando o estoque afetado ainda tem "espaço" pra reverter —
// ou seja, ninguém mexeu nele depois desse lançamento. Isso evita deixar o
// estoque com números negativos ou inconsistentes.
export async function excluirLancamento(empresaId: string, historicoId: string) {
  await exigirAcessoEmpresa(empresaId);

  const registro = await prisma.historico.findUnique({ where: { id: historicoId } });
  if (!registro || registro.empresaId !== empresaId) {
    throw new Error('Lançamento não encontrado.');
  }

  if (registro.tipo === 'ENTRADA') {
    const [bloco, rua, face] = (registro.destino || '').split('·');
    const estoque = await prisma.estoque.findFirst({
      where: { empresaId, produtoId: registro.produtoId, lote: registro.lote, bloco, rua, face }
    });
    if (!estoque || estoque.quantidadeTb < registro.quantidadeTb) {
      throw new Error(
        'Não deu pra excluir: esse estoque já foi movimentado depois desse lançamento (transferência, saída ou avaria).'
      );
    }
    const novaQtd = estoque.quantidadeTb - registro.quantidadeTb;
    if (novaQtd === 0) {
      await prisma.estoque.delete({ where: { id: estoque.id } });
    } else {
      await prisma.estoque.update({ where: { id: estoque.id }, data: { quantidadeTb: novaQtd } });
    }
  } else if (registro.tipo === 'SAIDA') {
    const [bloco, rua, face] = (registro.origem || '').split('·');
    const estoque = await prisma.estoque.findFirst({
      where: { empresaId, produtoId: registro.produtoId, lote: registro.lote, bloco, rua, face }
    });
    if (estoque) {
      await prisma.estoque.update({
        where: { id: estoque.id },
        data: { quantidadeTb: estoque.quantidadeTb + registro.quantidadeTb }
      });
    } else {
      await prisma.estoque.create({
        data: {
          empresaId,
          produtoId: registro.produtoId,
          lote: registro.lote,
          quantidadeTb: registro.quantidadeTb,
          bloco,
          rua,
          face
        }
      });
    }
  } else if (registro.tipo === 'TRANSFERENCIA') {
    const [blocoOrigem, ruaOrigem, faceOrigem] = (registro.origem || '').split('·');
    const [blocoDestino, ruaDestino, faceDestino] = (registro.destino || '').split('·');

    const estoqueDestino = await prisma.estoque.findFirst({
      where: {
        empresaId,
        produtoId: registro.produtoId,
        lote: registro.lote,
        bloco: blocoDestino,
        rua: ruaDestino,
        face: faceDestino
      }
    });
    if (!estoqueDestino || estoqueDestino.quantidadeTb < registro.quantidadeTb) {
      throw new Error(
        'Não deu pra excluir: o endereço de destino dessa transferência já foi movimentado depois.'
      );
    }

    const novaQtdDestino = estoqueDestino.quantidadeTb - registro.quantidadeTb;
    if (novaQtdDestino === 0) {
      await prisma.estoque.delete({ where: { id: estoqueDestino.id } });
    } else {
      await prisma.estoque.update({
        where: { id: estoqueDestino.id },
        data: { quantidadeTb: novaQtdDestino }
      });
    }

    const estoqueOrigem = await prisma.estoque.findFirst({
      where: {
        empresaId,
        produtoId: registro.produtoId,
        lote: registro.lote,
        bloco: blocoOrigem,
        rua: ruaOrigem,
        face: faceOrigem
      }
    });
    if (estoqueOrigem) {
      await prisma.estoque.update({
        where: { id: estoqueOrigem.id },
        data: { quantidadeTb: estoqueOrigem.quantidadeTb + registro.quantidadeTb }
      });
    } else {
      await prisma.estoque.create({
        data: {
          empresaId,
          produtoId: registro.produtoId,
          lote: registro.lote,
          quantidadeTb: registro.quantidadeTb,
          bloco: blocoOrigem,
          rua: ruaOrigem,
          face: faceOrigem
        }
      });
    }
  }

  await prisma.historico.delete({ where: { id: historicoId } });

  revalidatePath(`/${empresaId}/dashboard`);
  revalidatePath(`/${empresaId}/consulta`);
  revalidatePath(`/${empresaId}/historico`);
  revalidatePath(`/${empresaId}/movimentacao`);
}
