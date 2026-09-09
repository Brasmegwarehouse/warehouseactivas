'use client';

import { useState, useTransition } from 'react';

export default function ExcluirLancamentoButton({ action }: { action: () => Promise<void> }) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState('');

  function onClick() {
    const ok = confirm(
      'Excluir este lançamento? Isso reverte o estoque envolvido (quando possível) e não pode ser desfeito.'
    );
    if (!ok) return;

    setErro('');
    startTransition(async () => {
      try {
        await action();
      } catch (e: any) {
        setErro(e?.message || 'Não foi possível excluir.');
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        className="btn"
        onClick={onClick}
        disabled={pending}
        style={{
          padding: '4px 10px',
          fontSize: 11.5,
          color: 'var(--red)',
          borderColor: 'var(--red-soft)'
        }}
      >
        {pending ? 'Excluindo…' : 'Excluir'}
      </button>
      {erro && <div style={{ color: 'var(--red)', fontSize: 11, marginTop: 4, maxWidth: 180 }}>{erro}</div>}
    </div>
  );
}
