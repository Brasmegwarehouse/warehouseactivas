export { default } from 'next-auth/middleware';

export const config = {
  // Protege tudo, exceto login, rotas de auth e assets estáticos.
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)']
};
