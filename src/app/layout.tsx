import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "School Manager — La gestion scolaire, simplement",
  description: "La plateforme complète pour piloter votre établissement, accompagner les enseignants et suivre la réussite des apprenants.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
