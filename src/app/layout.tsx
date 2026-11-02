import type { Metadata } from "next";
import "./globals.css";
import "./brand.css";

export const metadata: Metadata = {
  title: "School Manager — La gestion scolaire, simplement",
  description: "La plateforme complète pour piloter votre établissement, accompagner les enseignants et suivre la réussite des apprenants.",
  icons: { icon: [{ url: "/favicon.ico", type: "image/x-icon" }], shortcut: "/favicon.ico" },
  openGraph: { title: "School Manager", description: "Gérez, suivez et faites réussir votre communauté éducative.", images: [{ url: "/brand/school-manager-hero.webp", width: 1000, height: 563, alt: "School Manager — gestion scolaire simplifiée" }] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
