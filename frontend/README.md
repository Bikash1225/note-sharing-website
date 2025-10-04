# Premium Notes Platform

A world-class notes sharing platform built with Next.js 15, featuring cutting-edge design, real-time collaboration, and enterprise-grade functionality.

## Features

- **Next.js 15** with Turbopack for lightning-fast development
- **Partial Prerendering** for optimal performance
- **Real-time Collaboration** with operational transforms
- **Advanced Rich Text Editor** with block-based content
- **Sophisticated Design System** with OKLCH color space
- **Enterprise Security** with Clerk authentication and advanced protection
- **Responsive Design** that works on all devices
- **Offline Support** with intelligent sync

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom design tokens
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk with enterprise-grade security
- **State Management**: Zustand with Immer
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Real-time**: Socket.io
- **File Upload**: UploadThing

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # Reusable UI components
├── lib/                 # Utilities and configurations
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
└── styles/              # Global styles and themes
```

## Development

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

## License

MIT