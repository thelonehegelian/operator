"use client";

import { useAtom } from "jotai";
import { authAtom } from "@/lib/store/atoms";
import { LoginForm } from "@/components/auth/LoginForm";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function Home() {
  const [auth] = useAtom(authAtom);

  if (!auth.isAuthenticated) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-md mx-auto">
          {/* Header with plugins link */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Operator</h1>
            <p className="text-muted-foreground mb-4">Matrix Frontend Framework</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant="outline">Phase 1 Complete</Badge>
              <Badge variant="default">Phase 2 Active</Badge>
            </div>
            <Link href="/plugins">
              <Button variant="outline" size="sm">
                🔌 Explore Plugins
              </Button>
            </Link>
          </div>

          <LoginForm />

          {/* Development info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Development Status</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span>✅ Core Chat Interface</span>
                <Badge variant="secondary" size="sm">
                  Phase 1
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>🔄 Make.com Plugin System</span>
                <Badge variant="default" size="sm">
                  Phase 2
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>⏳ Bridge Integration</span>
                <Badge variant="outline" size="sm">
                  Phase 3
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header with plugins link for authenticated users */}
      <div className="border-b bg-background px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Operator</h1>
          <Badge variant="outline">Phase 2</Badge>
        </div>
        <Link href="/plugins">
          <Button variant="outline" size="sm">
            🔌 Plugins
          </Button>
        </Link>
      </div>

      <div className="flex-1">
        <ChatLayout />
      </div>
    </div>
  );
}
