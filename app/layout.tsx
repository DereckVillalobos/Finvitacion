import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Invitación Secreta · Solo para Fabi',
  description:
    'Hay un pequeño secreto al otro lado de esta carta. Solo para Fabi.',
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
