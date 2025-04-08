import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar/>
        <SidebarTrigger className="fixed top-4 left-4.75 z-50" />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </>
  );
}
