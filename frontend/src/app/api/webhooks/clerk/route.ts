import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { UserMigrationService, ClerkUserData } from '@/lib/migration/user-migration'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set')
    return new NextResponse('Webhook secret not configured', { status: 500 })
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers')
    return new NextResponse('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: any

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new NextResponse('Error occurred during webhook verification', {
      status: 400,
    })
  }

  // Handle the webhook
  const migrationService = new UserMigrationService()
  
  try {
    switch (evt.type) {
      case 'user.created':
        console.log('Processing user.created webhook')
        const createResult = await migrationService.findOrCreateUser(evt.data as ClerkUserData)
        console.log('User creation result:', createResult)
        
        if (!createResult.success) {
          console.error('Failed to create/migrate user:', createResult.message)
          return new NextResponse(`Failed to process user creation: ${createResult.message}`, { 
            status: 500 
          })
        }
        break

      case 'user.updated':
        console.log('Processing user.updated webhook')
        const updateResult = await migrationService.updateUser(evt.data as ClerkUserData)
        console.log('User update result:', updateResult)
        
        if (!updateResult.success) {
          console.error('Failed to update user:', updateResult.message)
          // Don't return error for updates as they're not critical
        }
        break

      case 'user.deleted':
        console.log('Processing user.deleted webhook')
        const deleteResult = await migrationService.handleUserDeletion(evt.data as ClerkUserData)
        console.log('User deletion result:', deleteResult)
        
        if (!deleteResult.success) {
          console.error('Failed to handle user deletion:', deleteResult.message)
          // Don't return error for deletions as they're not critical
        }
        break

      default:
        console.log(`Unhandled webhook event type: ${evt.type}`)
        break
    }

    return new NextResponse('Webhook processed successfully', { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new NextResponse('Error processing webhook', { status: 500 })
  }
}

// Handle other HTTP methods
export async function GET() {
  return new NextResponse('Webhook endpoint - POST only', { status: 405 })
}

export async function PUT() {
  return new NextResponse('Webhook endpoint - POST only', { status: 405 })
}

export async function DELETE() {
  return new NextResponse('Webhook endpoint - POST only', { status: 405 })
}