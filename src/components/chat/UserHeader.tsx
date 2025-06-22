"use client";

import { useAtom } from "jotai";
import { authAtom } from "@/lib/store/atoms";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings, LogOut, User } from "lucide-react";

export function UserHeader() {
  const [auth, setAuth] = useAtom(authAtom);

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      isGuest: false,
    });
  };

  if (!auth.user) return null;

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <div className="h-full w-full bg-blue-500 flex items-center justify-center text-white font-medium">
            {auth.user.displayName?.[0]?.toUpperCase() || "U"}
          </div>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{auth.user.displayName || "Anonymous"}</p>
          <p className="text-xs text-gray-500 truncate">{auth.user.id}</p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="end">
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
