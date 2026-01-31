import type { Metadata } from 'next';
import Link from 'next/link';
import { WalletConnect } from '@/components/WalletConnect';
import { NetworkSelector } from '@/components/NetworkSelector';
import './globals.css';

export const metadata: Metadata = {
  title: 'Galaxy Wallet',
  description: 'Stellar wallet interface powered by Galaxy DevKit',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-gray-200 bg-white shadow-sm">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
            >
              Galaxy Wallet
            </Link>
            <nav className="flex flex-wrap items-center gap-3 sm:gap-4" aria-label="Main navigation">
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
              >
                Wallet
              </Link>
              <Link
                href="/settings"
                className="text-sm font-medium text-gray-700 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded"
              >
                Settings
              </Link>
              <NetworkSelector />
              <WalletConnect />
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">{children}</main>
      </body>
    </html>
  );
}
