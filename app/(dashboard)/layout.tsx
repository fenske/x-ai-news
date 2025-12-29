import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-terminal-bg">
      <Sidebar />
      <div className="pl-16 lg:pl-56">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
