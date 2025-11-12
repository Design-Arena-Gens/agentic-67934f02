import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TabunganKu SD - Sistem Tabungan Siswa",
  description: "Aplikasi tabungan digital untuk sekolah dasar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
