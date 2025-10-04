import { ClerkUserProfile } from '@/components/auth/clerk-user-profile'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">
            Manage your profile, security settings, and preferences
          </p>
        </div>
        
        <ClerkUserProfile />
      </div>
    </div>
  )
}