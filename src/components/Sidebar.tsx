'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  {
    label: 'Operação',
    items: [
      { slug: 'dashboard', icon: '◇', text: 'Painel' },
      { slug: 'movimentacao', icon: '⇄', text: 'Movimentação' },
      { slug: 'avaria', icon: '⚠', text: 'Registrar avaria' },
      { slug: 'consulta', icon: '▤', text: 'Consulta de estoque' },
      { slug: 'validades', icon: '◔', text: 'Validades' }
    ]
  },
  {
    label: 'Registros',
    items: [{ slug: 'historico', icon: '≡', text: 'Histórico' }]
  },
  {
    label: 'Cadastros',
    items: [
      { slug: 'produtos', icon: '◈', text: 'Produtos' },
      { slug: 'usuarios', icon: '◐', text: 'Usuários' },
      { slug: 'cobrancas', icon: '◎', text: 'Cobrança / Faturamento' }
    ]
  }
];

export default function Sidebar({
  empresaId,
  empresaNome,
  usuarioNome,
  perfil,
  ehAdmin
}: {
  empresaId: string;
  empresaNome: string;
  usuarioNome: string;
  perfil: string;
  ehAdmin?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="sidebar" id="sidebar">
      <div className="sb-brand">
        <Image src="/logo-brasmeg.png" alt="Brasmeg" width={28} height={28} />
        <div className="mark">
          Warehouse<span>One</span>
        </div>
      </div>

      <Link href="/empresas" className="sb-tenant">
        <div className="dot" />
        <div style={{ minWidth: 0 }}>
          <div className="t-name">{empresaNome}</div>
          <div className="t-sub">Armazém geral</div>
        </div>
        <div className="chg">trocar</div>
      </Link>

      {NAV.map((group) => (
        <div className="nav-group" key={group.label}>
          <div className="nav-label">{group.label}</div>
          {group.items.map((item) => {
            const active = pathname?.includes(`/${item.slug}`);
            return (
              <Link
                key={item.slug}
                href={`/${empresaId}/${item.slug}`}
                className={`nav-item ${active ? 'active' : ''}`}
              >
                <span className="ic">{item.icon}</span>
                {item.text}
              </Link>
            );
          })}
        </div>
      ))}

      {ehAdmin && (
        <div className="nav-group">
          <div className="nav-label">Administração</div>
          <Link
            href="/empresas/nova"
            className={`nav-item ${pathname === '/empresas/nova' ? 'active' : ''}`}
          >
            <span className="ic">+</span>
            Nova empresa
          </Link>
        </div>
      )}

      <div className="sb-foot">
        <div className="av">
          {usuarioNome
            .split(' ')
            .map((p) => p[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()}
        </div>
        <div>
          <div className="u-name">{usuarioNome}</div>
          <div className="u-role">{perfil}</div>
        </div>
      </div>
    </div>
  );
}
