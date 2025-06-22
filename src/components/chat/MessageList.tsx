"use client";

import { useAtom } from "jotai";
import { selectedRoomMessagesAtom, selectedRoomAtom } from "@/lib/store/atoms";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";
import { Message } from "@/schemas";

export function MessageList() {
  const [messages] = useAtom(selectedRoomMessagesAtom);
  const [selectedRoom] = useAtom(selectedRoomAtom);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatMessageContent = (message: Message) => {
    // Handle different message types
    switch (message.content.msgtype) {
      case "m.text":
        return message.content.body;
      case "m.emote":
        return `* ${message.content.body}`;
      case "m.image":
        return `📷 Image: ${message.content.body}`;
      case "m.file":
        return `📄 File: ${message.content.body}`;
      case "m.video":
        return `🎥 Video: ${message.content.body}`;
      case "m.audio":
        return `🎵 Audio: ${message.content.body}`;
      default:
        return message.content.body || "Unsupported message type";
    }
  };

  if (!selectedRoom) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Welcome to Matrix Chat</p>
          <p className="text-sm">Select a room to start messaging</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">{selectedRoom.name || "Room"}</p>
          <p className="text-sm">No messages yet. Be the first to say something!</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {/* Room Header */}
        <div className="text-center py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-2">{selectedRoom.name || "Unnamed Room"}</h2>
          {selectedRoom.topic && <p className="text-sm text-gray-600 dark:text-gray-400">{selectedRoom.topic}</p>}
          <p className="text-xs text-gray-500 mt-2">{selectedRoom.memberCount} members</p>
        </div>

        {/* Messages */}
        {messages.map((message, index) => {
          const prevMessage = index > 0 ? messages[index - 1] : null;
          const showSender = !prevMessage || prevMessage.sender !== message.sender;
          const timeDiff = prevMessage ? message.timestamp - prevMessage.timestamp : 0;
          const showTimestamp = !prevMessage || timeDiff > 5 * 60 * 1000; // 5 minutes

          return (
            <div key={message.id} className="flex space-x-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {showSender ? (
                  <Avatar className="h-8 w-8">
                    <div className="h-full w-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                      {message.sender[1]?.toUpperCase() || "U"}
                    </div>
                  </Avatar>
                ) : (
                  <div className="h-8 w-8" />
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                {/* Sender and Timestamp */}
                {showSender && (
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{message.sender}</span>
                    <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                  </div>
                )}

                {/* Message Body */}
                <div className="text-sm text-gray-800 dark:text-gray-200">
                  {message.replyTo && (
                    <div className="text-xs text-gray-500 mb-1 pl-2 border-l-2 border-gray-300">
                      Reply to previous message
                    </div>
                  )}

                  <div className={`${!showSender ? "pl-0" : ""}`}>{formatMessageContent(message)}</div>

                  {/* Reactions */}
                  {message.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.reactions.map((reaction) => (
                        <div
                          key={reaction.key}
                          className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs"
                        >
                          <span>{reaction.key}</span>
                          <span className="ml-1 text-gray-500">{reaction.count}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Edited indicator */}
                  {message.edited && <span className="text-xs text-gray-400 ml-2">(edited)</span>}
                </div>

                {/* Standalone timestamp for older messages */}
                {showTimestamp && !showSender && (
                  <div className="text-xs text-gray-400 mt-1">{formatTimestamp(message.timestamp)}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
