export default function ConnectLogin() {
  return (
    <div className="space-y-6 pt-12 max-w-md">
      <header className="space-y-2">
        <h1 className="font-mono text-2xl tracking-tight">Sign in</h1>
        <p className="text-zinc-400 text-sm">Use the email on your Luma ticket.</p>
      </header>
      <a
        href="/api/auth/sign-in"
        className="block w-full text-center px-6 py-3 bg-foreground text-background font-mono text-sm rounded-md hover:bg-foreground/90 transition-colors"
      >
        Continue with email
      </a>
      <a
        href="/api/auth/sign-up"
        className="block w-full text-center px-6 py-3 border border-white/15 text-foreground font-mono text-sm rounded-md hover:border-white/30 transition-colors"
      >
        First time? Create an account
      </a>
    </div>
  );
}
