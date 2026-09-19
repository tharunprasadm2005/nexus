import { ReactNode } from "react";
import { useWebSocket } from "../../context/WebSocketContext";
import NotificationBell from "./NotificationBell";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { onlineCount } = useWebSocket();

  return (
    <div className="flex h-screen overflow-hidden bg-holst-cream">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-3 bg-holst-cream border-b border-black/5 neu-flat">
          <div className="flex-1" />

          <div className="flex items-center gap-5">
            {/* Online indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full neu-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-holst-sage opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-holst-sage" />
              </span>
              <span className="font-body text-xs font-medium text-holst-navy-800">
                {onlineCount} online
              </span>
            </div>

            {/* Notifications */}
            <NotificationBell />
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
