"use client";

import { useAtom } from "jotai";
import { selectedRoomIdAtom, searchQueryAtom, filteredRoomsAtom } from "@/lib/store/atoms";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Hash, MessageCircle, Users } from "lucide-react";
import { Room } from "@/schemas";

export function RoomList() {
  const [selectedRoomId, setSelectedRoomId] = useAtom(selectedRoomIdAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [filteredRooms] = useAtom(filteredRoomsAtom);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const getRoomIcon = (room: Room) => {
    if (room.isDirect) {
      return <MessageCircle className="h-4 w-4" />;
    }
    return <Hash className="h-4 w-4" />;
  };

  const getBridgeIndicator = (room: Room) => {
    if (!room.bridgeInfo?.type) return null;

    const bridgeColors = {
      whatsapp: "bg-green-500",
      telegram: "bg-blue-500",
      discord: "bg-indigo-500",
      signal: "bg-blue-600",
    };

    return <div className={`w-2 h-2 rounded-full ${bridgeColors[room.bridgeInfo.type]} ml-1`} />;
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Room List */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {filteredRooms.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No rooms found</p>
              {searchQuery && <p className="text-xs mt-1">Try a different search term</p>}
            </div>
          ) : (
            filteredRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`
                  p-3 rounded-lg cursor-pointer transition-colors relative
                  ${
                    selectedRoomId === room.id
                      ? "bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  {/* Room Icon */}
                  <div className="flex items-center">
                    {getRoomIcon(room)}
                    {getBridgeIndicator(room)}
                  </div>

                  {/* Room Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{room.name || "Unnamed Room"}</p>
                      {room.lastMessage && (
                        <span className="text-xs text-gray-500">{formatTimestamp(room.lastMessage.timestamp)}</span>
                      )}
                    </div>

                    {room.lastMessage && (
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {room.lastMessage.sender}: {room.lastMessage.content}
                      </p>
                    )}
                  </div>

                  {/* Unread Indicators */}
                  <div className="flex flex-col items-end space-y-1">
                    {room.unreadCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {room.unreadCount}
                      </Badge>
                    )}
                    {room.highlightCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {room.highlightCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
