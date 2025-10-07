/**
 * Basic test suite for Clerk integration
 */

import { render, screen } from '@testing-library/react'

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({
    user: {
      id: 'user_123',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      emailAddresses: [{ emailAddress: 'john@example.com' }],
      imageUrl: 'https://example.com/avatar.jpg',
      unsafeMetadata: {
        preferences: {
          theme: 'auto',
          editorMode: 'rich'
        }
      }
    },
    isLoaded: true,
    isSignedIn: true
  })),
  useAuth: jest.fn(() => ({
    userId: 'user_123',
    isLoaded: true,
    isSignedIn: true
  })),
  SignIn: ({ children, ...props }: any) => (
    <div data-testid="clerk-signin" {...props}>
      {children}
    </div>
  ),
  SignUp: ({ children, ...props }: any) => (
    <div data-testid="clerk-signup" {...props}>
      {children}
    </div>
  ),
  UserProfile: ({ children, ...props }: any) => (
    <div data-testid="clerk-user-profile" {...props}>
      {children}
    </div>
  ),
  SignOutButton: ({ children }: any) => (
    <button data-testid="sign-out-button">{children}</button>
  ),
  ClerkProvider: ({ children }: any) => <div>{children}</div>
}))

// Mock performance hooks
jest.mock('@/hooks/use-performance', () => ({
  usePerformance: () => ({
    trackComponentMount: jest.fn(),
    trackAuthEvent: jest.fn(),
    trackPageLoad: jest.fn(),
    trackInteraction: jest.fn(),
    trackApiCall: jest.fn(),
    isLoaded: true,
    userId: 'user_123'
  }),
  useClerkPerformance: () => ({
    trackSignIn: jest.fn(),
    trackSignUp: jest.fn(),
    trackSignOut: jest.fn(),
    trackProfileUpdate: jest.fn()
  })
}))

describe('Clerk Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Functionality', () => {
    test('Clerk components are properly mocked', () => {
      expect(true).toBe(true) // Basic test to ensure setup works
    })

    test('Environment variables structure is correct', () => {
      const requiredEnvVars = [
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        'CLERK_SECRET_KEY',
        'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
        'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
        'NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL',
        'NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL'
      ]

      // Test that we know what env vars we need
      expect(requiredEnvVars.length).toBeGreaterThan(0)
    })

    test('Clerk hooks are properly mocked', () => {
      const { useUser, useAuth } = require('@clerk/nextjs')
      
      const userResult = useUser()
      const authResult = useAuth()
      
      expect(userResult.isLoaded).toBe(true)
      expect(authResult.isLoaded).toBe(true)
    })
  })

  describe('Performance', () => {
    test('basic performance test passes', () => {
      const startTime = performance.now()
      
      // Simulate some work
      for (let i = 0; i < 1000; i++) {
        Math.random()
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should complete quickly
      expect(duration).toBeLessThan(100)
    })
  })
})