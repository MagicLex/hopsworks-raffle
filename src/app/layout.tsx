import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hopsworks Book Raffle",
  description: "Win a copy of the O'Reilly MLOps book by Jim Dowling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
