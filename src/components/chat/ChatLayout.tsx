"use client";

import { useAtom } from "jotai";
import { authAtom, sidebarOpenAtom } from "@/lib/store/atoms";
import { LoginForm } from "@/components/auth/LoginForm";
import { RoomList } from "./RoomList";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { UserHeader } from "./UserHeader";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function ChatLayout() {
  const [auth] = useAtom(authAtom);
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);

  if (!auth.isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden`}
      >
        <UserHeader />
        <RoomList />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="ml-4">
            <h1 className="text-lg font-semibold">Matrix Chat</h1>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <MessageList />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <MessageInput />
        </div>
      </div>
    </div>
  );
}
