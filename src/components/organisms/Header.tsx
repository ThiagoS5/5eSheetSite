import { Menu, Swords, UserCircle } from "lucide-react";

export function Header() {
  return (
    <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border bg-background/90 px-4 text-foreground shadow-[0_0_15px_rgba(196,30,30,0.1)] backdrop-blur-xl transition-all md:px-8">
      <div className="flex h-full min-w-0 items-center gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-border bg-card text-primary"
          >
            <Swords className="h-5 w-5" />
          </span>
          <h1 className="truncate font-serif text-base font-bold uppercase tracking-widest text-primary sm:text-lg">
            FORGE & FATE
          </h1>
        </div>

        <nav
          aria-label="Navegacao principal"
          className="ml-4 hidden items-center gap-6 md:flex"
        >
          {["Vault", "Codex"].map((item) => (
            <a
              key={item}
              href="#"
              className="font-mono text-xs font-bold uppercase tracking-widest text-subdued outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/70"
            >
              {item}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Abrir menu"
          className="flex h-10 w-10 items-center justify-center rounded-md text-subdued outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/70 md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        <button
          type="button"
          aria-label="Abrir perfil do usuario"
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-card text-subdued outline-none transition-colors hover:border-primary hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/70"
        >
          <UserCircle className="h-6 w-6" />
        </button>
      </div>
    </header>
  );
}
