import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="font-display text-2xl">
            Noiva<span className="text-gold">Hub</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Organize seu casamento e encontre os fornecedores certos em um só lugar.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">Para noivas</p>
          <Link to="/precos" className="block text-muted-foreground hover:text-foreground">
            Planos
          </Link>
          <Link to="/fornecedores" className="block text-muted-foreground hover:text-foreground">
            Encontrar fornecedores
          </Link>
          <Link to="/noiva" className="block text-muted-foreground hover:text-foreground">
            Meu casamento
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">Para fornecedores</p>
          <Link
            to="/auth"
            search={{ modo: "cadastro", perfil: "fornecedor" }}
            className="block text-muted-foreground hover:text-foreground"
          >
            Divulgar meu negócio
          </Link>
          <Link to="/painel" className="block text-muted-foreground hover:text-foreground">
            Painel do fornecedor
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">Plataforma</p>
          <Link to="/auth" className="block text-muted-foreground hover:text-foreground">
            Entrar
          </Link>
          <span className="block text-muted-foreground">contato@noivahub.com.br</span>
        </div>
      </div>
      <div className="border-t border-border/70 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} NoivaHub. Fornecedores de demonstração são fictícios.
      </div>
    </footer>
  );
}
