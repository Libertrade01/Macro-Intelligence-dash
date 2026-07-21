import "./globals.css";
import AppShell from "../components/AppShell";

export const metadata = {
  title: "Macro Signal Room",
  description: "A living macro view built from the sources you trust",
};

export const viewport = {
  themeColor: "#0a0d12",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
