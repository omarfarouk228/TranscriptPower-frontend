export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-3xl items-center justify-center px-6 py-6">
        <p className="text-xs text-ink-muted">
          Powered by{" "}
          <a
            href="https://ofaroukk.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ink-muted underline decoration-line underline-offset-2 hover:text-accent"
          >
            Omar Farouk
          </a>
        </p>
      </div>
    </footer>
  );
}
