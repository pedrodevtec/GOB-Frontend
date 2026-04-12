import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { UpdateAnnouncementModal } from "@/components/layout/update-announcement-modal";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UpdateAnnouncementModal />
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:px-6">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Topbar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </>
  );
}
