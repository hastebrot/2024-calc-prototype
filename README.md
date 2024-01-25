# calc-prototype

**usage:**

- `❯ git clone https://github.com/hastebrot/calc-prototype`
- `❯ cd calc-prototype/calc-app/`
- `❯ bun install`
- `❯ bun run dev --port 5678`
- `❯ open -a safari --url "http://localhost:5678/"`

---

**initial setup:**

vite frontend tooling

- `❯ bun create vite calc-app --template react-swc-ts`
- `❯ cd calc-app/`
- `❯ bun install`
- `❯ bun run dev --port 5678`
- `❯ open -a safari --url "http://localhost:5678/"`
- `❯ bunx --bun vite build`
- more: https://bun.sh/guides/ecosystem/vite

tailwind css

- `❯ bun add -d tailwindcss postcss autoprefixer`
- `❯ bunx tailwindcss init --postcss --esm`
- more: https://tailwindcss.com/docs/guides/vite

lucide icons

- `❯ bun add -d lucide-react`

routing

- `❯ bun add -d react-router-dom`
- more: https://reactrouter.com/en/main/start/tutorial

state handling

- `❯ bun add -d zod zustand immer`
- `❯ bun add -d signia signia-react valtio bunshi`

testing

- `❯ bun add -D @types/bun vitest`
- `❯ bun add -D happy-dom @testing-library/react @testing-library/user-event`
