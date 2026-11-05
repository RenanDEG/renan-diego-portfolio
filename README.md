# Renan Diego — Portfolio

Portfólio de Renan Diego Inácio de Aquino: Growth, Performance, Marketing & Data.

## Stack

- Vite
- HTML
- CSS próprio
- JavaScript puro (vanilla)

Sem React, Next.js ou outros frameworks.

## Rodando localmente

Requisitos: Node.js 20.19+ (ou 22.12+) e npm.

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (normalmente http://localhost:5173).

## Build

```bash
npm run build
```

Os arquivos finais são gerados na pasta `dist/`.

## Preview

Para testar o build de produção localmente:

```bash
npm run preview
```

## Deploy: GitHub → Vercel

1. Crie um repositório vazio no GitHub.
2. Envie o projeto:

```bash
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/renan-diego-portfolio.git
git push -u origin main
```

3. Na Vercel, clique em **Add New → Project** e importe o repositório.
4. A Vercel detecta o Vite automaticamente (Build Command: `npm run build`, Output Directory: `dist`). Clique em **Deploy**.

## Depois do deploy

- Em `index.html`, preencha `<link rel="canonical" href="">` com a URL definitiva.
- Troque `/og-image.jpg` (og:image e twitter:image) pela URL absoluta, ex.: `https://SEU-DOMINIO/og-image.jpg`.

## Estrutura

```
renan-diego-portfolio/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── .gitignore
├── README.md
├── public/
│   ├── favicon.svg
│   ├── og-image.jpg
│   └── robots.txt
└── src/
    ├── css/style.css
    ├── js/main.js
    └── assets/images/renan-diego.webp
```
