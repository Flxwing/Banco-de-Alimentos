import { useState } from "react";
import {
  demoSequence,
  roleDescriptions,
  roleLabels,
} from "../data/mockData.js";
import { Field, RoleBadge } from "./ui.jsx";

export function LoginView({ users, error, onLogin }) {
  const [form, setForm] = useState({ username: "banco1", password: "1234" });

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin(form);
  };

  return (
    <section className="login-view">
      <div className="login-hero">
        <span className="eyebrow">Banco de Alimentos</span>
        <h1>Acceso para la prueba en clase</h1>
        <p>
          Entra como banco, donante u organización receptora para probar el
          flujo completo de distribución con datos simulados.
        </p>
        <div className="login-highlights">
          <span>Datos simulados</span>
          <span>Usuarios listos</span>
          <span>Sin backend</span>
        </div>
      </div>

      <div className="login-card">
        <div className="section-heading">
          <span className="eyebrow">Iniciar sesión</span>
          <h2>Selecciona un usuario de prueba</h2>
          <p>Todos los usuarios usan la contraseña 1234.</p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <Field label="Usuario">
            <input
              value={form.username}
              onChange={(event) =>
                setForm({ ...form, username: event.target.value })
              }
              placeholder="Ej. banco1"
            />
          </Field>
          <Field label="Contraseña">
            <input
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              type="password"
              placeholder="1234"
            />
          </Field>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-primary" type="submit">
            Entrar al prototipo
          </button>
        </form>

        <section className="poc-guide" aria-label="Guía de uso">
          <div className="guide-block">
            <span className="eyebrow">Guía rápida</span>
            <h3>Qué prueba cada rol</h3>
            <div className="role-guide-grid">
              {Object.entries(roleLabels).map(([role, label]) => (
                <article className="role-guide" key={role}>
                  <RoleBadge role={role} label={label} />
                  <p>{roleDescriptions[role]}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="guide-block">
            <span className="eyebrow">Secuencia sugerida</span>
            <ol className="demo-sequence">
              {demoSequence.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </section>

        <section className="demo-users-section" aria-label="Usuarios de prueba">
          <div className="section-heading compact-heading">
            <span className="eyebrow">Usuarios de prueba</span>
            <h3>Accesos para compañeros</h3>
          </div>
          <div className="demo-users">
            {users.map((user) => (
              <button
                className="demo-user"
                type="button"
                key={user.id}
                onClick={() =>
                  setForm({ username: user.username, password: user.password })
                }
              >
                <span>
                  <strong>{user.username}</strong>
                  <small>{user.name}</small>
                </span>
                <span className="user-meta">
                  <RoleBadge role={user.role} label={roleLabels[user.role]} />
                  <small>Clave: {user.password}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
