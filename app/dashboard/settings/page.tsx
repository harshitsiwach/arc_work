/**
 * Arc Work — Settings
 * Account and workspace settings
 */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, User, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-fg)" }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-fg-secondary)" }}>
          Manage your account preferences
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Profile */}
        <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User size={16} style={{ color: "var(--color-accent)" }} />
              <CardTitle className="text-base">Profile</CardTitle>
            </div>
            <CardDescription>Update your display name and bio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--color-fg-secondary)" }}>Display Name</label>
              <Input placeholder="Your name" style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }} />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color: "var(--color-fg-secondary)" }}>Bio</label>
              <Input placeholder="Tell us about yourself" style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-bd)", color: "var(--color-fg)" }} />
            </div>
            <Button size="sm" style={{ backgroundColor: "var(--color-accent)" }}>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell size={16} style={{ color: "var(--color-accent)" }} />
              <CardTitle className="text-base">Notifications</CardTitle>
            </div>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>Notification settings coming soon</p>
          </CardContent>
        </Card>

        {/* Security */}
        <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield size={16} style={{ color: "var(--color-accent)" }} />
              <CardTitle className="text-base">Security</CardTitle>
            </div>
            <CardDescription>Manage your security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>Security settings coming soon</p>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-bd)" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette size={16} style={{ color: "var(--color-accent)" }} />
              <CardTitle className="text-base">Appearance</CardTitle>
            </div>
            <CardDescription>Customize your theme and display</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs" style={{ color: "var(--color-fg-muted)" }}>Use the theme switcher in the navbar to toggle between light and dark mode</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
