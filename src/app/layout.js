import "./globals.css";
import AppShell from "../components/AppShell";

export const metadata = {
  title: "Macro Intelligence",
  description: "Living macro overview, podcast inputs, and newsletter speedruns",
  themeColor: "#111217",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
