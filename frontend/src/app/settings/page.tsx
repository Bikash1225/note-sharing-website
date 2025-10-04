'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { ClerkUserProfile } from '@/components/auth/clerk-user-profile'

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const [preferences, setPreferences] = useState({
    theme: 'auto',
    editorMode: 'rich',
    notifications: true,
    collaborationUpdates: true,
    weeklySummary: false
  })

  useEffect(() => {
    // Load user preferences from database or Clerk metadata
    if (user) {
      const userPrefs = user.unsafeMetadata?.preferences as any
      if (userPrefs) {
        setPreferences(prev => ({ ...prev, ...userPrefs }))
      }
    }
  }, [user])
  const breadcrumbItems = [
    { label: 'Settings', isActive: true }
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="text-3xl font-bold mt-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>
                  Manage your profile information, avatar, and account settings through Clerk.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClerkUserProfile />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how the application looks and feels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select 
                    value={preferences.theme} 
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, theme: value }))}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Editor Mode</Label>
                  <Select 
                    value={preferences.editorMode} 
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, editorMode: value }))}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rich">Rich Text</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={() => {
                  // Save preferences to Clerk metadata or database
                  user?.update({
                    unsafeMetadata: {
                      ...user.unsafeMetadata,
                      preferences
                    }
                  })
                }}>
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Security settings are managed through Clerk. Use the Profile tab to access password, 
                  two-factor authentication, and other security features.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Enhanced Security with Clerk</h4>
                  <p className="text-blue-700 text-sm mb-3">
                    Your account security is managed by Clerk, providing enterprise-grade protection including:
                  </p>
                  <ul className="text-blue-700 text-sm space-y-1 ml-4">
                    <li>• Multi-factor authentication (MFA)</li>
                    <li>• Passwordless authentication options</li>
                    <li>• Session management and device tracking</li>
                    <li>• Advanced fraud detection</li>
                  </ul>
                  <Button 
                    variant="outline" 
                    className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-100"
                    onClick={() => {
                      // Switch to profile tab
                      const profileTab = document.querySelector('[value="profile"]') as HTMLElement
                      profileTab?.click()
                    }}
                  >
                    Manage Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose what notifications you want to receive.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.notifications}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, notifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Collaboration Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone collaborates on your notes
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.collaborationUpdates}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, collaborationUpdates: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Summary</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a weekly summary of your activity
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.weeklySummary}
                    onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, weeklySummary: checked }))}
                  />
                </div>

                <Button onClick={() => {
                  // Save notification preferences
                  user?.update({
                    unsafeMetadata: {
                      ...user.unsafeMetadata,
                      preferences
                    }
                  })
                }}>
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}