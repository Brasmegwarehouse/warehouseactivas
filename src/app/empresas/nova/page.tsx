import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUsuarioLogado, usuarioEhAdmin } from '@/lib/tenant';
import { criarEmpresa } from './actions';

export default async function NovaEmpresaPage() {
  const usuario = await getUsuarioLogado();
  const ehAdmin = await usuarioEhAdmin(usuario.id);

  // Blindagem também na página: quem não é admin nem vê o formulário.
  if (!ehAdmin) redirect('/empresas');

  return (
    <div id="view-empresas" style={{ display: 'flex' }}>
      <div className="emp-wrap">
        <div className="eyebrow">Administração</div>
        <h2>Nova empresa</h2>

        <form action={criarEmpresa}>
          <div className="field">
            <label htmlFor="nome">Nome da empresa</label>
            <input id="nome" name="nome" placeholder="Ex: Activas" required autoFocus />
          </div>

          <div className="field">
            <label htmlFor="slug">Identificador (opcional)</label>
            <input id="slug" name="slug" placeholder="gerado automaticamente a partir do nome" />
          </div>

          <div className="field">
            <label htmlFor="contatoNome">Contato responsável</label>
            <input id="contatoNome" name="contatoNome" placeholder="Nome do contato" />
          </div>

          <div className="field">
            <label htmlFor="contatoEmail">E-mail do contato</label>
            <input id="contatoEmail" name="contatoEmail" type="email" placeholder="contato@empresa.com" />
          </div>

          <div className="btn-row">
            <button type="submit" className="btn primary block">
              Criar empresa
            </button>
          </div>
        </form>

        <p className="login-foot">
          <Link href="/empresas">← Voltar para seleção de empresas</Link>
        </p>
      </div>
    </div>
  );
}
