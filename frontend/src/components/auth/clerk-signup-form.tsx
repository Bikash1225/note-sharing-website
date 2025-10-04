'use client'

import { SignUp } from '@clerk/nextjs'
import { useClerkPerformance } from '@/hooks/use-performance'

export function ClerkSignUpForm() {
  const { trackSignUp } = useClerkPerformance('SignUpForm')
  return (
    <div className="flex justify-center">
      <SignUp 
        appearance={{
          elements: {
            // Main card styling
            card: 'shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl',
            
            // Header styling
            headerTitle: 'text-2xl font-bold text-gray-900 mb-2',
            headerSubtitle: 'text-gray-600 text-sm',
            
            // Form styling
            formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg',
            
            // Input styling
            formFieldInput: 'w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50',
            formFieldLabel: 'text-sm font-medium text-gray-700 mb-2',
            
            // Social buttons
            socialButtonsBlockButton: 'border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3',
            socialButtonsBlockButtonText: 'font-medium',
            
            // Divider
            dividerLine: 'bg-gray-200',
            dividerText: 'text-gray-500 text-sm font-medium',
            
            // Footer links
            footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200',
            
            // Error styling
            formFieldErrorText: 'text-red-500 text-sm mt-1',
            
            // Success styling
            formFieldSuccessText: 'text-green-500 text-sm mt-1',
            
            // Loading state
            spinner: 'text-blue-600',
            
            // Layout
            main: 'gap-6',
            formFieldRow: 'gap-4',
            
            // Verification code styling
            otpCodeFieldInput: 'w-12 h-12 text-center border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 font-mono text-lg',
            
            // Additional premium touches
            identityPreviewText: 'text-gray-600',
            identityPreviewEditButton: 'text-blue-600 hover:text-blue-700',
            
            // Modal overlay (if used)
            modalBackdrop: 'backdrop-blur-sm bg-black/20',
            modalContent: 'shadow-2xl rounded-2xl'
          },
          layout: {
            socialButtonsPlacement: 'top',
            socialButtonsVariant: 'blockButton',
            showOptionalFields: true
          },
          variables: {
            colorPrimary: '#3b82f6',
            colorSuccess: '#10b981',
            colorWarning: '#f59e0b',
            colorDanger: '#ef4444',
            colorNeutral: '#6b7280',
            colorText: '#111827',
            colorTextSecondary: '#6b7280',
            colorBackground: '#ffffff',
            colorInputBackground: '#ffffff',
            colorInputText: '#111827',
            borderRadius: '0.75rem',
            fontFamily: 'var(--font-geist-sans)',
            fontSize: '0.875rem',
            fontWeight: {
              normal: '400',
              medium: '500',
              semibold: '600',
              bold: '700'
            }
          }
        }}
        redirectUrl="/dashboard"
        signInUrl="/auth/signin"
      />
    </div>
  )
}