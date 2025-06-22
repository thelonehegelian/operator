"use client";

import { useAtom } from "jotai";
import { authAtom } from "@/lib/store/atoms";
import { LoginForm } from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MakePlugin from "@/plugins/make";
import Link from "next/link";

export default function PluginsPage() {
  const [auth] = useAtom(authAtom);

  if (!auth.isAuthenticated) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-md mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Plugin Access</CardTitle>
              <CardDescription>Please log in to access and configure plugins</CardDescription>
            </CardHeader>
          </Card>
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Operator Plugins</h1>
            <p className="text-muted-foreground">
              Extend your Matrix experience with powerful automation and integration plugins
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">← Back to Chat</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="make">Make.com Integration</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Make.com Plugin Card */}
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    🤖 Make.com Integration
                    <Badge variant="default">Phase 2</Badge>
                  </CardTitle>
                </div>
                <CardDescription>
                  Automate workflows using Make.com webhooks with flexible message parsing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Trello</Badge>
                    <Badge variant="outline">Gmail</Badge>
                    <Badge variant="outline">Sheets</Badge>
                    <Badge variant="outline">+3 more</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Trello task creation ready
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>6 service templates available
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      Pattern-based message parsing
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Link href="/plugins?tab=make">
                      <Button size="sm" className="w-full">
                        Configure Make Integration
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Placeholder for Future Plugins */}
            <Card className="opacity-60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔌 Bridge Manager
                  <Badge variant="secondary">Phase 3</Badge>
                </CardTitle>
                <CardDescription>Manage WhatsApp, Telegram, and Discord bridge connections</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Coming in Phase 3...</p>
              </CardContent>
            </Card>

            <Card className="opacity-60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🧵 Thread Manager
                  <Badge variant="secondary">Future</Badge>
                </CardTitle>
                <CardDescription>Advanced thread organization and management tools</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Planned for future release...</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Plugin Development</CardTitle>
              <CardDescription>
                Operator's plugin-first architecture makes it easy to extend functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">🏗️ Framework Architecture</h4>
                    <p className="text-muted-foreground">
                      Built on Next.js with TypeScript, Jotai state management, and Zod validation
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">🔌 Plugin API</h4>
                    <p className="text-muted-foreground">
                      Simple plugin structure with hooks for messages, reactions, and UI components
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">📚 Documentation</h4>
                    <p className="text-muted-foreground">
                      Comprehensive guides and examples for building custom plugins
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="make" className="space-y-6">
          <MakePlugin />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Settings</CardTitle>
              <CardDescription>Global settings for all plugins</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Plugin settings configuration coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
