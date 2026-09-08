import Rackmap from '@/components/Rackmap';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <div id="view-login">
      <div className="login-visual">
        <div className="brand-mark">
          Warehouse<span>One</span>
        </div>
        <Rackmap cols={24} rows={16} density={0.35} style={{ opacity: 0.55 }} />
        <div className="caption">
          <div className="eyebrow">Bloco · Rua · Face</div>
          <h1>Cada tambor tem um endereço. Cada endereço, um dono.</h1>
          <p>
            Controle de estoque armazém geral com rastreabilidade por lote, validade e posição —
            pensado para operação real de armazém.
          </p>
        </div>
      </div>
      <div className="login-form-side">
        <div className="login-card">
          <h2>Entrar</h2>
          <p className="sub">Acesse sua conta WarehouseOne</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
