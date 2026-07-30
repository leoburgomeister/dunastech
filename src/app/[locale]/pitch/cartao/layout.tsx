import type { Metadata } from 'next';

// Cartão de palco é material interno de apresentação: contém estratégia de
// preço, leitura de plateia e notas táticas. A rota precisa ser pública para
// abrir no celular no dia, mas não deve ser indexada nem seguida por robôs.
export const metadata: Metadata = {
  title: 'Cartão de palco',
  robots: { index: false, follow: false, nocache: true },
};

export default function CartaoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
