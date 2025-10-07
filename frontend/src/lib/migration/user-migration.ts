import { prisma } from '@/lib/prisma'
import { User } from '@prisma/client'

export interface ClerkUserData {
  id: string // Clerk user ID
  emailAddresses: Array<{
    emailAddress: string
    id: string
  }>
  firstName?: string
  lastName?: string
  imageUrl?: string
  username?: string
  createdAt: number
  updatedAt: number
}

export interface MigrationResult {
  success: boolean
  userId?: string
  clerkId?: string
  message: string
  error?: any
}

export class UserMigrationService {
  /**
   * Find or create a user based on Clerk user data
   */
  async findOrCreateUser(clerkUser: ClerkUserData): Promise<MigrationResult> {
    try {
      const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress
      
      if (!primaryEmail) {
        return {
          success: false,
          message: 'No email address found in Clerk user data'
        }
      }

      // Check if user already exists with this Clerk ID
      const existingClerkUser = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id }
      })

      if (existingClerkUser) {
        return {
          success: true,
          userId: existingClerkUser.id,
          clerkId: clerkUser.id,
          message: 'User already linked to Clerk'
        }
      }

      // Check if user exists by email (for migration)
      const existingUser = await prisma.user.findUnique({
        where: { email: primaryEmail }
      })

      if (existingUser) {
        // Link existing user to Clerk
        return await this.migrateUser(clerkUser, existingUser)
      } else {
        // Create new user
        return await this.createNewUser(clerkUser)
      }
    } catch (error) {
      console.error('Error in findOrCreateUser:', error)
      return {
        success: false,
        message: 'Failed to find or create user',
        error
      }
    }
  }

  /**
   * Migrate an existing user to Clerk
   */
  async migrateUser(clerkUser: ClerkUserData, existingUser: User): Promise<MigrationResult> {
    try {
      const migrationId = `migration_${Date.now()}`
      
      // Create migration record
      await prisma.userMigration.create({
        data: {
          userId: existingUser.id,
          clerkId: clerkUser.id,
          email: existingUser.email,
          migrationStatus: 'pending',
          migrationData: {
            clerkUserId: clerkUser.id,
            clerkUserEmail: clerkUser.emailAddresses[0]?.emailAddress,
            existingUserId: existingUser.id,
            existingUserEmail: existingUser.email,
            existingUserUsername: existingUser.username
          }
        }
      })

      // Update user with Clerk ID and migration info
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          clerkId: clerkUser.id,
          migratedAt: new Date(),
          migrationId,
          // Update profile info from Clerk if available
          displayName: clerkUser.firstName && clerkUser.lastName 
            ? `${clerkUser.firstName} ${clerkUser.lastName}` 
            : existingUser.displayName,
          avatar: clerkUser.imageUrl || existingUser.avatar,
          lastActiveAt: new Date()
        }
      })

      // Mark migration as completed
      await prisma.userMigration.updateMany({
        where: { 
          userId: existingUser.id,
          clerkId: clerkUser.id 
        },
        data: {
          migrationStatus: 'completed',
          completedAt: new Date()
        }
      })

      return {
        success: true,
        userId: updatedUser.id,
        clerkId: clerkUser.id,
        message: 'User successfully migrated to Clerk'
      }
    } catch (error) {
      console.error('Error migrating user:', error)
      
      // Mark migration as failed
      try {
        await prisma.userMigration.updateMany({
          where: { 
            userId: existingUser.id,
            clerkId: clerkUser.id 
          },
          data: {
            migrationStatus: 'failed',
            migrationData: {
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        })
      } catch (updateError) {
        console.error('Error updating migration status:', updateError)
      }

      return {
        success: false,
        message: 'Failed to migrate user to Clerk',
        error
      }
    }
  }

  /**
   * Create a new user from Clerk data
   */
  async createNewUser(clerkUser: ClerkUserData): Promise<MigrationResult> {
    try {
      const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress
      
      if (!primaryEmail) {
        return {
          success: false,
          message: 'No email address found in Clerk user data'
        }
      }

      // Generate username from email or use Clerk username
      const username = clerkUser.username || primaryEmail.split('@')[0]
      
      // Ensure username is unique
      let finalUsername = username
      let counter = 1
      while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
        finalUsername = `${username}${counter}`
        counter++
      }

      const newUser = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: primaryEmail,
          username: finalUsername,
          displayName: clerkUser.firstName && clerkUser.lastName 
            ? `${clerkUser.firstName} ${clerkUser.lastName}` 
            : finalUsername,
          avatar: clerkUser.imageUrl,
          migratedAt: new Date(),
          migrationId: `new_user_${Date.now()}`,
          preferences: {
            theme: 'auto',
            editorMode: 'rich',
            notifications: true,
            collaborationSettings: {}
          },
          subscription: {
            tier: 'free',
            expiresAt: null
          }
        }
      })

      return {
        success: true,
        userId: newUser.id,
        clerkId: clerkUser.id,
        message: 'New user created successfully'
      }
    } catch (error) {
      console.error('Error creating new user:', error)
      return {
        success: false,
        message: 'Failed to create new user',
        error
      }
    }
  }

  /**
   * Update user data from Clerk
   */
  async updateUser(clerkUser: ClerkUserData): Promise<MigrationResult> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id }
      })

      if (!existingUser) {
        return {
          success: false,
          message: 'User not found with Clerk ID'
        }
      }

      const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress
      
      const updatedUser = await prisma.user.update({
        where: { clerkId: clerkUser.id },
        data: {
          email: primaryEmail || existingUser.email,
          displayName: clerkUser.firstName && clerkUser.lastName 
            ? `${clerkUser.firstName} ${clerkUser.lastName}` 
            : existingUser.displayName,
          avatar: clerkUser.imageUrl || existingUser.avatar,
          lastActiveAt: new Date()
        }
      })

      return {
        success: true,
        userId: updatedUser.id,
        clerkId: clerkUser.id,
        message: 'User updated successfully'
      }
    } catch (error) {
      console.error('Error updating user:', error)
      return {
        success: false,
        message: 'Failed to update user',
        error
      }
    }
  }

  /**
   * Handle user deletion from Clerk
   */
  async handleUserDeletion(clerkUser: ClerkUserData): Promise<MigrationResult> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { clerkId: clerkUser.id }
      })

      if (!existingUser) {
        return {
          success: true,
          message: 'User not found, no action needed'
        }
      }

      // For now, we'll just remove the Clerk ID but keep the user data
      // In a production app, you might want to implement soft deletion
      await prisma.user.update({
        where: { clerkId: clerkUser.id },
        data: {
          clerkId: null,
          // Optionally mark as deleted or implement soft deletion
        }
      })

      return {
        success: true,
        userId: existingUser.id,
        message: 'User Clerk association removed'
      }
    } catch (error) {
      console.error('Error handling user deletion:', error)
      return {
        success: false,
        message: 'Failed to handle user deletion',
        error
      }
    }
  }

  /**
   * Rollback migration for a user
   */
  async rollbackMigration(userId: string): Promise<MigrationResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        }
      }

      // Remove Clerk ID and migration data
      await prisma.user.update({
        where: { id: userId },
        data: {
          clerkId: null,
          migratedAt: null,
          migrationId: null
        }
      })

      // Update migration records
      await prisma.userMigration.updateMany({
        where: { userId },
        data: {
          migrationStatus: 'failed',
          migrationData: {
            rollback: true,
            rolledBackAt: new Date()
          }
        }
      })

      return {
        success: true,
        userId,
        message: 'Migration rolled back successfully'
      }
    } catch (error) {
      console.error('Error rolling back migration:', error)
      return {
        success: false,
        message: 'Failed to rollback migration',
        error
      }
    }
  }

  /**
   * Get migration status for a user
   */
  async getMigrationStatus(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          clerkId: true,
          migratedAt: true,
          migrationId: true
        }
      })

      const migrations = await prisma.userMigration.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })

      return {
        user,
        migrations,
        isMigrated: !!user?.clerkId
      }
    } catch (error) {
      console.error('Error getting migration status:', error)
      return null
    }
  }
}