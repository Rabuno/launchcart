import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LaunchCart — MVP Sales Pages',
  description: 'Create simple product sales pages and collect lightweight orders.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
