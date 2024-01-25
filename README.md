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

- https://bun.sh/guides/ecosystem/vite
- `❯ bun create vite calc-app --template react-swc-ts`
- `❯ cd calc-app/`
- `❯ bun install`
- `❯ bun run dev --port 5678`
- `❯ open -a safari --url "http://localhost:5678/"`
- `❯ bunx --bun vite build`

tailwind css

- https://tailwindcss.com/docs/guides/vite
- `❯ bun add -d tailwindcss postcss autoprefixer`
- `❯ bunx tailwindcss init --postcss --esm`
