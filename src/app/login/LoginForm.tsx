'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    const res = await signIn('credentials', { email, senha, redirect: false });
    setCarregando(false);
    if (res?.error) {
      setErro('E-mail ou senha incorretos.');
      return;
    }
    router.push('/empresas');
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>E-mail</label>
        <input
          type="email"
          placeholder="voce@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label>Senha</label>
        <input
          type="password"
          placeholder="••••••••"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
      </div>
      {erro && (
        <div className="info-strip" style={{ color: 'var(--red)', background: 'var(--red-soft)', borderColor: 'var(--red)' }}>
          {erro}
        </div>
      )}
      <button className="btn primary block" type="submit" disabled={carregando}>
        {carregando ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
