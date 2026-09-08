import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash('123456', 10);

  const usuario = await prisma.usuario.upsert({
    where: { email: 'admin@brasmeg.com.br' },
    update: {},
    create: { nome: 'Marcos Bittar', email: 'admin@brasmeg.com.br', senhaHash }
  });

  const empresa = await prisma.empresa.upsert({
    where: { slug: 'citrosuco' },
    update: {},
    create: {
      nome: 'Citrosuco',
      slug: 'citrosuco',
      contatoNome: 'Renata Alves',
      contatoEmail: 'renata@citrosuco.com'
    }
  });

  await prisma.usuarioEmpresa.upsert({
    where: { usuarioId_empresaId: { usuarioId: usuario.id, empresaId: empresa.id } },
    update: {},
    create: { usuarioId: usuario.id, empresaId: empresa.id, perfil: 'ADMIN' }
  });

  const produto = await prisma.produto.upsert({
    where: { empresaId_sku: { empresaId: empresa.id, sku: 'CITROSUCO-001' } },
    update: {},
    create: {
      empresaId: empresa.id,
      sku: 'CITROSUCO-001',
      descricao: 'Óleo essencial laranja',
      familia: 'Óleo',
      embalagem: 'Tambor metálico',
      capacidadeL: 200,
      tbPorPallet: 4
    }
  });

  await prisma.estoque.createMany({
    data: [
      {
        empresaId: empresa.id,
        produtoId: produto.id,
        lote: 'L2025-001',
        quantidadeTb: 120,
        bloco: 'A',
        rua: '01',
        face: '03',
        validade: new Date('2027-03-12')
      },
      {
        empresaId: empresa.id,
        produtoId: produto.id,
        lote: 'L2025-014',
        quantidadeTb: 64,
        bloco: 'A',
        rua: '01',
        face: '04',
        validade: new Date('2026-08-02')
      }
    ]
  });

  await prisma.tipoCobranca.createMany({
    data: [
      { empresaId: empresa.id, nome: 'Armazenagem', unidade: 'pallet/mês', valorUnitario: 42 },
      { empresaId: empresa.id, nome: 'Movimentação', unidade: 'TB', valorUnitario: 3.5 },
      { empresaId: empresa.id, nome: 'Etiquetagem', unidade: 'etiqueta', valorUnitario: 0.8 }
    ]
  });

  console.log('Seed concluído.');
  console.log('Login: admin@brasmeg.com.br / senha: 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
