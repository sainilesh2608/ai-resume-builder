# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Local development (resume parsing + generation)

1. Copy `.env.example` to `.env` and set your Google Generative Language API key:

	GEMINI_API_KEY=YOUR_KEY_HERE

2. Install dependencies and run both servers:

```bash
npm install
npm run dev:full
```

This runs the backend on port `5000` and the Vite frontend (auto-assigned port). The frontend proxies `/api` requests to the backend in development.

If you previously had an API key in `.env.local`, remove it — store server secrets in `.env` instead.
