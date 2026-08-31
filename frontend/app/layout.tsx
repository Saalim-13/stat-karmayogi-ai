import type { Metadata } from "next";
import { Shell } from "@/components/shell";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "STAT KARMAYOGI AI",
  description: "Learn. Improve. Serve with Data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,650&family=Source+Sans+3:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <I18nProvider><Shell>{children}</Shell></I18nProvider>
      </body>
    </html>
  );
}
