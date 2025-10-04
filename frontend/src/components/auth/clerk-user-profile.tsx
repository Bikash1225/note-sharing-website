'use client'

import { UserProfile } from '@clerk/nextjs'

export function ClerkUserProfile() {
  return (
    <div className="flex justify-center p-6">
      <UserProfile 
        appearance={{
          elements: {
            // Main card styling
            card: 'shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl max-w-4xl',
            
            // Header styling
            headerTitle: 'text-2xl font-bold text-gray-900 mb-2',
            headerSubtitle: 'text-gray-600 text-sm',
            
            // Navigation styling
            navbar: 'bg-gray-50/50 border-r border-gray-200 rounded-l-2xl',
            navbarButton: 'text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 font-medium py-3 px-4 rounded-lg transition-all duration-200 mx-2',
            navbarButtonActive: 'text-blue-600 bg-blue-50 font-semibold',
            
            // Form styling
            formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg',
            formButtonSecondary: 'border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all duration-200',
            
            // Input styling
            formFieldInput: 'w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50',
            formFieldLabel: 'text-sm font-medium text-gray-700 mb-2',
            
            // Avatar styling
            avatarBox: 'rounded-2xl shadow-lg border-4 border-white',
            avatarImageActionsUpload: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200',
            avatarImageActionsRemove: 'bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200',
            
            // Page styling
            page: 'bg-white rounded-r-2xl p-8',
            pageScrollBox: 'space-y-6',
            
            // Section styling
            profileSection: 'bg-gray-50/30 rounded-xl p-6 border border-gray-100',
            profileSectionTitle: 'text-lg font-semibold text-gray-900 mb-4',
            profileSectionContent: 'space-y-4',
            
            // Error styling
            formFieldErrorText: 'text-red-500 text-sm mt-1',
            
            // Success styling
            formFieldSuccessText: 'text-green-500 text-sm mt-1',
            
            // Loading state
            spinner: 'text-blue-600',
            
            // Layout
            main: 'gap-0',
            
            // Additional premium touches
            identityPreviewText: 'text-gray-600',
            identityPreviewEditButton: 'text-blue-600 hover:text-blue-700',
            
            // Modal overlay (if used)
            modalBackdrop: 'backdrop-blur-sm bg-black/20',
            modalContent: 'shadow-2xl rounded-2xl',
            
            // Security section
            accordionTriggerButton: 'text-gray-700 hover:text-blue-600 font-medium py-3 px-4 rounded-lg transition-all duration-200',
            
            // Connected accounts
            connectedAccountsIconBox: 'rounded-lg p-2 bg-gray-100',
            
            // Danger section
            destructiveActionButton: 'bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200'
          },
          layout: {
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
      />
    </div>
  )
}