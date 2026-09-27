# Novadontic Control Panel

The frontend for the Novadontic Orthodontic Lab Management System.

## Structure

```text
src/
├── app/
│   ├── layout/                # Top-level workspace shell
│   └── styles/                # Tokens, reset, utilities, and component CSS
├── features/
│   └── dashboard/             # Dashboard-owned cases and screen UI
├── shared/
│   ├── lib/                   # Small framework-neutral helpers
│   └── ui/                    # Hand-built Base UI primitives
└── main.tsx                   # Browser entry point
```

The visual system is deliberately flat: a neutral canvas, white surfaces,
compact spacing, no card borders, and rounded corners capped at `rounded-lg`.
The UI primitives are built on Base UI where behavior is useful, while all
visual styling lives in `src/app/styles/`.

## Commands

```bash
pnpm dev       # Start the Vite development server
pnpm lint      # Check source files with ESLint
pnpm build     # Type-check and create a production build
pnpm preview   # Preview the production build locally
```
