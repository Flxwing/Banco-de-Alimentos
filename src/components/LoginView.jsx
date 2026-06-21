import { useState } from "react";
import { roleLabels } from "../data/mockData.js";
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
        <span className="eyebrow">Red solidaria de distribución</span>
        <h1>Banco de Alimentos</h1>
        <p>
          Coordinamos donaciones, inventario y entregas para acercar alimentos
          disponibles a organizaciones que los necesitan.
        </p>
        <div className="login-highlights" aria-label="Servicios principales">
          <span>Donaciones</span>
          <span>Inventario</span>
          <span>Distribución</span>
        </div>
      </div>

      <div className="login-card">
        <div className="section-heading login-heading">
          <span className="eyebrow">Acceso seguro</span>
          <h2>Iniciar sesión</h2>
          <p>Ingresa con las credenciales asignadas a tu organización.</p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <Field label="Usuario">
            <input
              value={form.username}
              onChange={(event) =>
                setForm({ ...form, username: event.target.value })
              }
              autoComplete="username"
              placeholder="Nombre de usuario"
            />
          </Field>
          <Field label="Contraseña">
            <input
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              type="password"
              autoComplete="current-password"
              placeholder="Contraseña"
            />
          </Field>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-primary" type="submit">
            Ingresar
          </button>
        </form>

        <details className="account-directory">
          <summary>Seleccionar cuenta disponible</summary>
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
                  <strong>{user.name}</strong>
                  <small>{user.username}</small>
                </span>
                <RoleBadge role={user.role} label={roleLabels[user.role]} />
              </button>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}
