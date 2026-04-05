# KTP website!!!!!!!

## Tech Stack

- **Runtime:** [Bun](https://bun.sh) — fast JavaScript runtime and package manager
- **Framework:** [Next.js](https://nextjs.org) (App Router) — React framework with server-side rendering
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com) v4

## Project Structure

```
ktpwebsite/
├── public/              # Static assets (images, fonts, etc.)
├── src/
│   └── app/             # Next.js App Router
│       ├── globals.css  # Global styles and Tailwind imports
│       ├── layout.tsx   # Root layout (wraps all pages)
│       ├── page.tsx     # Home page (/)
│       └── favicon.ico  # Site favicon
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── next.config.ts       # Next.js configuration
├── postcss.config.mjs   # PostCSS config (Tailwind plugin)
├── eslint.config.mjs    # ESLint configuration
└── bun.lock             # Bun lockfile
```

### How the App Router works

Each folder inside `src/app/` becomes a URL route. To add a new page, create a folder with a `page.tsx` file:

- `src/app/page.tsx` → `/`
- `src/app/about/page.tsx` → `/about`
- `src/app/members/page.tsx` → `/members`

`layout.tsx` files wrap all pages in their directory and below. The root `layout.tsx` contains the `<html>` and `<body>` tags.

## Running Locally

### Prerequisites

#### Install Bun

**macOS:**

```bash
curl -fsSL https://bun.sh/install | bash
```

Or with Homebrew:

```bash
brew install oven-sh/bun/bun
```

**Windows:**

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

> **Note:** On Windows, Bun requires Windows 10 version 1809 or later. If you run into issues, consider using [WSL](https://learn.microsoft.com/en-us/windows/wsl/install) (Windows Subsystem for Linux) and following the macOS/Linux instructions inside WSL.

**Verify installation:**

```bash
bun --version
```

If the command isn't found after installing, restart your terminal (or run `source ~/.zshrc` / `source ~/.bashrc`).

### Setup

1. **Clone the repository:**

   ```bash
   git clone <repo-url>
   cd ktpwebsite
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Start the development server:**

   ```bash
   bun run dev
   ```

4. **Open the site:** Visit [http://localhost:3000](http://localhost:3000) in your browser.

The dev server hot-reloads — any file changes will instantly appear in the browser.

### Other Commands

| Command         | Description                       |
| --------------- | --------------------------------- |
| `bun run dev`   | Start development server          |
| `bun run build` | Create production build           |
| `bun run start` | Serve production build            |
| `bun run lint`  | Run ESLint                        |
