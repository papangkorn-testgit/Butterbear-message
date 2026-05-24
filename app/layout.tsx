import "./globals.css";
import { Fredoka } from "next/font/google";

const fredoka = Fredoka({
  subsets: ["latin"],
});

export const metadata = {
  title: "Bear Message",
  description: "For tired days",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${fredoka.className} h-full`}>
        {children}
      </body>
    </html>
  );
}