'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams?.get('error')

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'Configuration':
        return {
          title: 'Configuration Error',
          description: 'There is a problem with the server configuration. Please contact support.',
          action: 'Contact Support'
        }
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          description: 'You do not have permission to sign in with this account.',
          action: 'Try Different Account'
        }
      case 'Verification':
        return {
          title: 'Verification Error',
          description: 'The verification token has expired or is invalid. Please try signing in again.',
          action: 'Sign In Again'
        }
      case 'Default':
      default:
        return {
          title: 'Authentication Error',
          description: 'An error occurred during authentication. Please try again.',
          action: 'Try Again'
        }
    }
  }

  const errorInfo = getErrorMessage(error || null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Authentication Error</h1>
          <p className="text-gray-600">
            We encountered an issue while trying to sign you in
          </p>
        </div>
        
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-red-600">{errorInfo.title}</CardTitle>
            <CardDescription className="text-gray-600">
              {errorInfo.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => router.push('/auth/signin')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {errorInfo.action}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">
                  Error Code: <code className="bg-gray-200 px-1 rounded">{error}</code>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>
            Need help?{' '}
            <Link href="/support" className="text-blue-600 hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}