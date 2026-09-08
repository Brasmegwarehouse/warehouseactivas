/**
 * Regras de negócio do estoque.
 *
 * IMPORTANTE: as fórmulas abaixo são um ponto de partida razoável (arredondamento
 * para cima, cubagem por cilindro/caixa). Cole aqui as fórmulas exatas do seu
 * WarehouseOne_v6_4.gs original para garantir 100% de paridade com os números
 * que a operação já está acostumada a ver.
 */

export function calcularPallets(quantidadeTb: number, tbPorPallet: number): number {
  if (tbPorPallet <= 0) return 0;
  return Math.ceil(quantidadeTb / tbPorPallet);
}

type FormaEmbalagem = 'cilindro' | 'caixa';

export function calcularCubagemUnitariaM3(params: {
  forma: FormaEmbalagem;
  diametroM?: number;
  alturaM?: number;
  comprimentoM?: number;
  larguraM?: number;
}): number {
  const { forma, diametroM, alturaM, comprimentoM, larguraM } = params;
  if (forma === 'cilindro' && diametroM && alturaM) {
    const raio = diametroM / 2;
    return Math.PI * raio * raio * alturaM;
  }
  if (forma === 'caixa' && comprimentoM && larguraM && alturaM) {
    return comprimentoM * larguraM * alturaM;
  }
  return 0;
}

export function diasParaVencer(validade: Date | null): number | null {
  if (!validade) return null;
  const hoje = new Date();
  const diffMs = validade.getTime() - hoje.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function statusValidade(validade: Date | null): 'ok' | 'warn' | 'danger' {
  const dias = diasParaVencer(validade);
  if (dias === null) return 'ok';
  if (dias < 0) return 'danger';
  if (dias <= 30) return 'warn';
  return 'ok';
}

export function formatarEndereco(bloco: string, rua: string, face: string): string {
  return `${bloco}·${rua}·${face}`;
}
