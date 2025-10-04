import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  },
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
    button: 'button',
    h1: 'h1',
    h2: 'h2',
    p: 'p',
    ul: 'ul',
    li: 'li',
  },
  AnimatePresence: ({ children }) => children,
}))

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: null,
    isLoaded: true,
    isSignedIn: false,
  }),
  useAuth: () => ({
    userId: null,
    isLoaded: true,
    isSignedIn: false,
  }),
  SignIn: ({ children }) => children,
  SignUp: ({ children }) => children,
  UserProfile: ({ children }) => children,
  SignOutButton: ({ children }) => children,
  ClerkProvider: ({ children }) => children,
}))