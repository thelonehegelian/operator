"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { selectedRoomIdAtom, authAtom } from "@/lib/store/atoms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile } from "lucide-react";
import { matrixClient } from "@/lib/matrix/client";

export function MessageInput() {
  const [selectedRoomId] = useAtom(selectedRoomIdAtom);
  const [auth] = useAtom(authAtom);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !selectedRoomId || sending) return;

    setSending(true);
    try {
      await matrixClient.sendMessage(selectedRoomId, {
        msgtype: "m.text",
        body: message.trim(),
      });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
      // TODO: Show error toast
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage({
        preventDefault: () => {},
        currentTarget: e.currentTarget,
      } as React.FormEvent);
    }
  };

  if (!selectedRoomId || !auth.isAuthenticated) {
    return null;
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800">
      <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
        {/* Attachment Button */}
        <Button type="button" variant="ghost" size="sm" className="flex-shrink-0" disabled={sending}>
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            disabled={sending}
            className="pr-10 resize-none min-h-[40px]"
          />

          {/* Emoji Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            disabled={sending}
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        {/* Send Button */}
        <Button type="submit" size="sm" disabled={!message.trim() || sending} className="flex-shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {/* Typing Indicator Area */}
      <div className="h-4 mt-2">{/* TODO: Add typing indicators */}</div>
    </div>
  );
}
