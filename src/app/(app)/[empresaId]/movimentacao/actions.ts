'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { exigirAcessoEmpresa } from '@/lib/tenant';
import { formatarEndereco } from '@/lib/business';

export async function registrarEntrada(empresaId: string, formData: FormData) {
  const { usuario } = await exigirAcessoEmpresa(empresaId);

  const produtoId = String(formData.get('produtoId'));
  const lote = String(formData.get('lote') || '').trim();
  const quantidadeTb = Number(formData.get('quantidadeTb') || 0);
  const bloco = String(formData.get('bloco') || '');
  const rua = String(formData.get('rua') || '');
  const face = String(formData.get('face') || '');
  const dataFabricacao = formData.get('dataFabricacao') ? new Date(String(formData.get('dataFabricacao'))) : null;
  const validade = formData.get('validade') ? new Date(String(formData.get('validade'))) : null;
  const observacao = String(formData.get('observacao') || '') || null;

  if (!produtoId || !lote || quantidadeTb <= 0) {
    throw new Error('Produto, lote e quantidade são obrigatórios.');
  }

  await prisma.$transaction([
    prisma.estoque.create({
      data: { empresaId, produtoId, lote, quantidadeTb, bloco, rua, face, dataFabricacao, validade }
    }),
    prisma.historico.create({
      data: {
        empresaId,
        produtoId,
        lote,
        tipo: 'ENTRADA',
        quantidadeTb,
        destino: formatarEndereco(bloco, rua, face),
        operador: usuario.name,
        observacao
      }
    })
  ]);

  revalidatePath(`/${empresaId}/dashboard`);
  revalidatePath(`/${empresaId}/consulta`);
  revalidatePath(`/${empresaId}/historico`);
}

export async function registrarTransferencia(empresaId: string, formData: FormData) {
  const { usuario } = await exigirAcessoEmpresa(empresaId);

  const estoqueOrigemId = String(formData.get('estoqueOrigemId'));
  const quantidadeTb = Number(formData.get('quantidadeTb') || 0);
  const blocoDestino = String(formData.get('blocoDestino') || '');
  const ruaDestino = String(formData.get('ruaDestino') || '');
  const faceDestino = String(formData.get('faceDestino') || '');

  const origem = await prisma.estoque.findUnique({ where: { id: estoqueOrigemId } });
  if (!origem || quantidadeTb <= 0 || quantidadeTb > origem.quantidadeTb) {
    throw new Error('Quantidade inválida para transferência.');
  }

  const enderecoOrigem = formatarEndereco(origem.bloco, origem.rua, origem.face);
  const enderecoDestino = formatarEndereco(blocoDestino, ruaDestino, faceDestino);

  await prisma.$transaction([
    prisma.estoque.update({
      where: { id: origem.id },
      data: { quantidadeTb: origem.quantidadeTb - quantidadeTb }
    }),
    prisma.estoque.create({
      data: {
        empresaId,
        produtoId: origem.produtoId,
        lote: origem.lote,
        quantidadeTb,
        bloco: blocoDestino,
        rua: ruaDestino,
        face: faceDestino,
        dataFabricacao: origem.dataFabricacao,
        validade: origem.validade
      }
    }),
    prisma.historico.create({
      data: {
        empresaId,
        produtoId: origem.produtoId,
        lote: origem.lote,
        tipo: 'TRANSFERENCIA',
        quantidadeTb,
        origem: enderecoOrigem,
        destino: enderecoDestino,
        operador: usuario.name
      }
    })
  ]);

  revalidatePath(`/${empresaId}/dashboard`);
  revalidatePath(`/${empresaId}/consulta`);
  revalidatePath(`/${empresaId}/historico`);
}

export async function registrarSaida(empresaId: string, formData: FormData) {
  const { usuario } = await exigirAcessoEmpresa(empresaId);

  const estoqueId = String(formData.get('estoqueId'));
  const quantidadeTb = Number(formData.get('quantidadeTb') || 0);
  const observacao = String(formData.get('observacao') || '') || null;

  const registro = await prisma.estoque.findUnique({ where: { id: estoqueId } });
  if (!registro || quantidadeTb <= 0 || quantidadeTb > registro.quantidadeTb) {
    throw new Error('Quantidade inválida para saída.');
  }

  const enderecoOrigem = formatarEndereco(registro.bloco, registro.rua, registro.face);

  await prisma.$transaction([
    prisma.estoque.update({
      where: { id: registro.id },
      data: { quantidadeTb: registro.quantidadeTb - quantidadeTb }
    }),
    prisma.historico.create({
      data: {
        empresaId,
        produtoId: registro.produtoId,
        lote: registro.lote,
        tipo: 'SAIDA',
        quantidadeTb,
        origem: enderecoOrigem,
        operador: usuario.name,
        observacao
      }
    })
  ]);

  revalidatePath(`/${empresaId}/dashboard`);
  revalidatePath(`/${empresaId}/consulta`);
  revalidatePath(`/${empresaId}/historico`);
}
