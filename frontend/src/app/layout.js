import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata = {
  title: "Smart Academic Attendance & Leave Management System",
  description: "BCA Final Year Academic ERP Project developed by Alok Raghav",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
