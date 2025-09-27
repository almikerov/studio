import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MultiSchedule',
  description: 'Create, translate, and share your daily schedule.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  );
}
