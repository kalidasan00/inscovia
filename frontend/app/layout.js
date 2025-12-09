// app/layout.js
import "./globals.css";
import BottomNav from "../components/BottomNav";

export const metadata = {
  title: "Inscovia — Coaching & Training Centers",
  description: "Find the best IT & Non-IT coaching and training centers near you."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}