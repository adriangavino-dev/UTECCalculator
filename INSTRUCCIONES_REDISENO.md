# 🚀 Calculadora UTEC — Rediseño Quantum (Trinity Cool Blue)

Este ZIP contiene tu proyecto con el **nuevo design system Quantum** ya integrado.
La paleta cambió de **cyan/fuchsia/violet** (rosa-morado) a **cyan/teal/sky** (azules fríos).

---

## 📋 Qué cambió

### Archivos NUEVOS (no existían antes)
- `src/components/BrandMark.jsx` — el logo de calculadora SVG
- `src/components/WelcomePicker.jsx` — la pantalla de selección de carrera (extraída de App.jsx)
- `src/components/AppShell.jsx` — el header + filtros + búsqueda (extraído de App.jsx)
- `src/components/CourseGrid.jsx` — el grid de cursos (extraído de App.jsx)
- `src/assets/logo-calc.svg` — el nuevo logo SVG

### Archivos MODIFICADOS
- `src/App.jsx` — ahora es **mucho más corto**, solo orquesta los componentes
- `src/components/ModalCalculo.jsx` — nueva paleta (fuchsia → teal, violet → sky)
- `src/index.css` — variables de diseño y wash de fondo actualizados
- `index.html` — nuevo título (`Calculadora UTEC · Quantum`)
- `public/favicon.svg` — nuevo logo de calculadora

### Archivos INTACTOS (no se tocaron)
- `src/logic/useCalculadora.js` — toda tu lógica
- `src/data/cursos.json` — tu data
- `package.json` y `package-lock.json` — mismas dependencias
- `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `eslint.config.js`

---

## 🛠️ Cómo aplicar los cambios (paso a paso)

### Opción A — Reemplazo completo (más simple)

1. Antes que nada, en tu proyecto actual, haz un commit de respaldo:
   ```bash
   git add .
   git commit -m "version antes de aplicar Quantum redesign"
   git checkout -b rediseno-quantum
   ```

2. **Borra** las siguientes carpetas/archivos de tu proyecto actual:
   - `src/App.jsx`
   - `src/index.css`
   - `src/components/ModalCalculo.jsx`
   - `index.html`
   - `public/favicon.svg`

3. **Copia desde este ZIP** a tu proyecto:
   - Todo el contenido de `src/` (sobrescribiendo)
   - `index.html`
   - `public/favicon.svg`

4. Verifica que funciona:
   ```bash
   npm run dev
   ```

5. Si todo se ve bien:
   ```bash
   git add .
   git commit -m "feat: aplicar design system Quantum (trinity cool blue)"
   git checkout main
   git merge rediseno-quantum
   ```

### Opción B — Comparar archivo por archivo (más cuidadoso)

Abre VS Code y compara cada archivo modificado lado a lado:
- Click derecho en tu archivo original → "Select for Compare"
- Click derecho en el del ZIP → "Compare with Selected"

---

## 🚢 Subir a GitHub

Si quieres subir esto a GitHub:

```bash
# Si tu proyecto YA tiene un remoto en GitHub:
git push origin main

# Si NO tienes un repo en GitHub aún:
# 1. Crea uno en github.com → New repository (sin README, sin .gitignore)
# 2. En tu terminal:
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git branch -M main
git push -u origin main
```

---

## 🎨 Resumen visual de la nueva paleta

| Antes (viejo)        | Ahora (Quantum)        |
|----------------------|------------------------|
| Cyan `#22d3ee`       | Cyan `#22d3ee` (igual) |
| Fuchsia `#e879f9`    | Teal `#14b8a6`         |
| Violet `#a78bfa`     | Sky `#38bdf8`          |
| Logo "CN" gradiente  | Logo SVG calculadora   |

El "trinity gradient" ahora va: **cyan → teal → sky** (todo azul-cool).

---

¿Problemas? Cualquier error de import o build, vuelve al main con
`git checkout main` y reporta el error con el mensaje exacto.
