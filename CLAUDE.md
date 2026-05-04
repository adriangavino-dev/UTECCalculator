# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — production build (outputs to `dist/`)
- `npm run preview` — serve the production build locally
- `npm run lint` — run ESLint over the repo (`eslint .`)

There is no test runner configured.

## Architecture

This is a single-page React 19 + Vite + Tailwind v4 app for calculating UTEC course grade averages. The whole UI lives in `src/App.jsx` and a single modal in `src/components/ModalCalculo.jsx`; all state and business logic is in the `useCalculadora` hook.

### Data model: `src/data/cursos.json`

Each course is an object with `id`, `nombre`, `carrera` (string OR array of strings — a course can belong to multiple carreras), and `sistema` describing how the final grade is computed. Two shapes appear inside `sistema`:

1. **Flat weight** — value is a number representing the weight (e.g. `"EP": 0.30`). Weights at the top level should sum to 1.
2. **Nested with sub-grades** — value is `{ peso: <number>, subNotas: { <subKey>: <weight>, ... } }`. The sub-weights inside `subNotas` should sum to 1; `peso` is that group's contribution to the final grade.

When adding a new course, mirror this shape. The UI in `ModalCalculo.jsx` branches on `typeof config === 'number'` vs the nested object form, so keeping the schema consistent matters.

### State flow: `src/logic/useCalculadora.js`

- `notasGlobales` is a single object keyed by `cursoId`, where each course's value is `{ [llaveNota]: valor }`. Sub-grade keys are flattened as `${parentKey}_${subKey}` (e.g. `EC1_Lab 1`). Both `actualizarNota` and `calcularPromedio` rely on this naming convention — keep them in sync if you change one.
- `notasGlobales` and `misCursosIds` (favorites) are persisted to `localStorage` under the keys `quantum_notas` and `quantum_favoritos`.
- `LISTA_CARRERAS` is hard-coded inside the hook; courses must use one of those exact strings in their `carrera` field to be filterable.
- `calcularPromedio` reads from `notasGlobales[curso.id]`, walks `curso.sistema`, and writes the result into `resultado` (a string with two decimals via `toFixed(2)`). Missing or non-numeric inputs are coerced to `0`.

### Styling

Tailwind v4 via `@tailwindcss/postcss`; `src/index.css` imports Tailwind and defines a small amount of global CSS (background, font, custom scrollbar). Components use inline Tailwind utility classes — there are no CSS modules or styled-components.

### ESLint quirk

`no-unused-vars` is configured with `varsIgnorePattern: '^[A-Z_]'`, so unused identifiers starting with an uppercase letter or underscore won't fail the lint. Don't rename local lowercase variables to uppercase to silence the rule.
