"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useCallback } from "react";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authAtom, roomsAtom, messagesAtom } from "@/lib/store/atoms";
import { AuthStateSchema, RoomSchema, MessageSchema } from "@/schemas";

// Dynamic import for Matrix SDK to avoid SSR issues
const createMatrixClient = async (config: {
  baseUrl: string;
  accessToken?: string;
  userId?: string;
  deviceId?: string;
}) => {
  if (typeof window === "undefined") {
    throw new Error("Matrix client can only be created on client side");
  }

  const { createClient } = await import("matrix-js-sdk");
  return createClient(config);
};

export function LoginForm() {
  const [auth, setAuth] = useAtom(authAtom);
  const [, setRooms] = useAtom(roomsAtom);
  const [, setMessages] = useAtom(messagesAtom);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({
    homeserver: "https://matrix.org",
    username: "",
    password: "",
  });

  const handleDemoMode = useCallback(() => {
    // Set up mock authentication
    const mockAuth = AuthStateSchema.parse({
      isAuthenticated: true,
      user: {
        id: "@demo:matrix.org",
        displayName: "Demo User",
      },
      accessToken: "demo_token",
      homeserver: "https://matrix.org",
      deviceId: "demo_device",
      isGuest: false,
    });

    // Set up mock rooms
    const mockRooms = [
      RoomSchema.parse({
        id: "!general:matrix.org",
        name: "General Discussion",
        topic: "Welcome to the general discussion room",
        isDirect: false,
        isEncrypted: false,
        memberCount: 15,
        unreadCount: 3,
        highlightCount: 1,
        tags: ["m.favourite"],
      }),
      RoomSchema.parse({
        id: "!dev:matrix.org",
        name: "Development Team",
        topic: "Discussing development progress",
        isDirect: false,
        isEncrypted: true,
        memberCount: 8,
        unreadCount: 0,
        highlightCount: 0,
        tags: [],
      }),
      RoomSchema.parse({
        id: "!whatsapp:matrix.org",
        name: "WhatsApp Bridge",
        topic: "Messages from WhatsApp",
        isDirect: false,
        isEncrypted: false,
        memberCount: 5,
        unreadCount: 7,
        highlightCount: 0,
        tags: [],
        bridgeInfo: {
          type: "whatsapp",
          status: "connected",
        },
      }),
      RoomSchema.parse({
        id: "!alice:matrix.org",
        name: "Alice Smith",
        isDirect: true,
        isEncrypted: true,
        memberCount: 2,
        unreadCount: 1,
        highlightCount: 0,
        tags: [],
      }),
      RoomSchema.parse({
        id: "!bob:matrix.org",
        name: "Bob Wilson",
        isDirect: true,
        isEncrypted: true,
        memberCount: 2,
        unreadCount: 0,
        highlightCount: 0,
        tags: [],
      }),
    ];

    // Set up mock messages
    const mockMessages = {
      "!general:matrix.org": [
        MessageSchema.parse({
          id: "$msg1:matrix.org",
          roomId: "!general:matrix.org",
          sender: "@alice:matrix.org",
          content: {
            msgtype: "m.text",
            body: "Hey everyone! How's the project going?",
          },
          timestamp: Date.now() - 3600000, // 1 hour ago
          edited: false,
          reactions: [
            {
              key: "👍",
              users: ["@bob:matrix.org", "@charlie:matrix.org"],
              count: 2,
            },
          ],
          replyTo: undefined,
          threadId: undefined,
          isEncrypted: false,
        }),
        MessageSchema.parse({
          id: "$msg2:matrix.org",
          roomId: "!general:matrix.org",
          sender: "@bob:matrix.org",
          content: {
            msgtype: "m.text",
            body: "Great progress! Just finished the authentication system.",
          },
          timestamp: Date.now() - 1800000, // 30 minutes ago
          edited: false,
          reactions: [],
          replyTo: "$msg1:matrix.org",
          threadId: undefined,
          isEncrypted: false,
        }),
        MessageSchema.parse({
          id: "$msg3:matrix.org",
          roomId: "!general:matrix.org",
          sender: "@demo:matrix.org",
          content: {
            msgtype: "m.text",
            body: "This is a demo message to test the UI! 🚀",
          },
          timestamp: Date.now() - 60000, // 1 minute ago
          edited: false,
          reactions: [],
          replyTo: undefined,
          threadId: undefined,
          isEncrypted: false,
        }),
      ],
      "!whatsapp:matrix.org": [
        MessageSchema.parse({
          id: "$wa1:matrix.org",
          roomId: "!whatsapp:matrix.org",
          sender: "@whatsapp_bridge:matrix.org",
          content: {
            msgtype: "m.text",
            body: "Message from WhatsApp: Hello from mobile!",
          },
          timestamp: Date.now() - 900000, // 15 minutes ago
          edited: false,
          reactions: [],
          replyTo: undefined,
          threadId: undefined,
          isEncrypted: false,
        }),
      ],
      "!alice:matrix.org": [
        MessageSchema.parse({
          id: "$dm1:matrix.org",
          roomId: "!alice:matrix.org",
          sender: "@alice:matrix.org",
          content: {
            msgtype: "m.text",
            body: "Hey! Can we chat about the project?",
          },
          timestamp: Date.now() - 300000, // 5 minutes ago
          edited: false,
          reactions: [],
          replyTo: undefined,
          threadId: undefined,
          isEncrypted: true,
        }),
      ],
    };

    setAuth(mockAuth);
    setRooms(mockRooms);
    setMessages(mockMessages);
  }, [setAuth, setRooms, setMessages]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create temporary client for login
      const tempClient = await createMatrixClient({
        baseUrl: credentials.homeserver,
      });

      // Attempt login
      const loginResponse = await tempClient.login("m.login.password", {
        user: credentials.username,
        password: credentials.password,
      });

      // Validate and store auth state
      const authState = AuthStateSchema.parse({
        isAuthenticated: true,
        user: {
          id: loginResponse.user_id,
          displayName: credentials.username,
        },
        accessToken: loginResponse.access_token,
        homeserver: credentials.homeserver,
        deviceId: loginResponse.device_id,
        isGuest: false,
      });

      setAuth(authState);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const tempClient = await createMatrixClient({
        baseUrl: credentials.homeserver,
      });

      const guestResponse = await tempClient.registerGuest();

      const authState = AuthStateSchema.parse({
        isAuthenticated: true,
        user: {
          id: guestResponse.user_id,
          displayName: "Guest User",
        },
        accessToken: guestResponse.access_token,
        homeserver: credentials.homeserver,
        deviceId: guestResponse.device_id,
        isGuest: true,
      });

      setAuth(authState);
    } catch (err) {
      console.error("Guest login failed:", err);
      setError("Guest login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (auth.isAuthenticated) {
    return null; // Will be handled by parent component
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to Matrix</CardTitle>
          <CardDescription>Enter your Matrix credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="homeserver" className="block text-sm font-medium mb-1">
                Homeserver
              </label>
              <Input
                id="homeserver"
                type="url"
                value={credentials.homeserver}
                onChange={(e) => setCredentials((prev) => ({ ...prev, homeserver: e.target.value }))}
                placeholder="https://matrix.org"
                required
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="@username:matrix.org"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div className="space-y-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Logging in..." : "Login"}
              </Button>

              <Button type="button" variant="outline" onClick={handleGuestLogin} disabled={loading} className="w-full">
                {loading ? "Creating guest account..." : "Continue as Guest"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleDemoMode}
                className="w-full bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                🚀 Demo Mode (Development)
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
