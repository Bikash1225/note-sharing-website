#!/usr/bin/env tsx

/**
 * User Migration Script for Clerk Integration
 * 
 * This script helps migrate existing users from NextAuth.js to Clerk.
 * It should be run after setting up Clerk and before removing NextAuth.js completely.
 * 
 * Usage:
 * npm run migrate-users
 * 
 * Or with specific options:
 * npm run migrate-users -- --dry-run
 * npm run migrate-users -- --batch-size=50
 */

import { PrismaClient } from '@prisma/client'
import { UserMigrationService } from '../lib/migration/user-migration'

const prisma = new PrismaClient()
const migrationService = new UserMigrationService()

interface MigrationOptions {
  dryRun: boolean
  batchSize: number
  verbose: boolean
}

class UserMigrationScript {
  private options: MigrationOptions

  constructor(options: Partial<MigrationOptions> = {}) {
    this.options = {
      dryRun: false,
      batchSize: 100,
      verbose: true,
      ...options
    }
  }

  async run() {
    console.log('🚀 Starting user migration to Clerk...')
    console.log(`Options: ${JSON.stringify(this.options, null, 2)}`)

    try {
      // Get migration statistics
      const stats = await this.getMigrationStats()
      console.log('\n📊 Migration Statistics:')
      console.log(`Total users: ${stats.totalUsers}`)
      console.log(`Already migrated: ${stats.migratedUsers}`)
      console.log(`Pending migration: ${stats.pendingUsers}`)
      console.log(`Users with passwords: ${stats.usersWithPasswords}`)

      if (stats.pendingUsers === 0) {
        console.log('✅ All users are already migrated!')
        return
      }

      if (this.options.dryRun) {
        console.log('\n🔍 DRY RUN MODE - No changes will be made')
        await this.simulateMigration()
      } else {
        console.log('\n⚠️  LIVE MIGRATION MODE - Changes will be made to the database')
        const confirmed = await this.confirmMigration()
        if (!confirmed) {
          console.log('Migration cancelled by user.')
          return
        }
        await this.performMigration()
      }

    } catch (error) {
      console.error('❌ Migration failed:', error)
      process.exit(1)
    } finally {
      await prisma.$disconnect()
    }
  }

  private async getMigrationStats() {
    const totalUsers = await prisma.user.count()
    const migratedUsers = await prisma.user.count({
      where: { clerkId: { not: null } }
    })
    const pendingUsers = totalUsers - migratedUsers
    const usersWithPasswords = await prisma.user.count({
      where: { password: { not: null } }
    })

    return {
      totalUsers,
      migratedUsers,
      pendingUsers,
      usersWithPasswords
    }
  }

  private async simulateMigration() {
    console.log('\n🔍 Simulating migration process...')
    
    const pendingUsers = await prisma.user.findMany({
      where: { clerkId: null },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        createdAt: true
      },
      take: this.options.batchSize
    })

    console.log(`\nFound ${pendingUsers.length} users to migrate:`)
    
    for (const user of pendingUsers) {
      console.log(`  - ${user.email} (${user.username}) - Created: ${user.createdAt.toISOString()}`)
    }

    console.log('\n📝 Migration steps that would be performed:')
    console.log('1. Create Clerk accounts for users (manual step required)')
    console.log('2. Link existing users to Clerk IDs via webhook')
    console.log('3. Update user records with migration metadata')
    console.log('4. Verify data integrity')
    console.log('5. Remove password fields (optional)')
  }

  private async performMigration() {
    console.log('\n🔄 Starting live migration...')
    
    const pendingUsers = await prisma.user.findMany({
      where: { clerkId: null },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        createdAt: true
      },
      take: this.options.batchSize
    })

    console.log(`Processing ${pendingUsers.length} users...`)

    let successCount = 0
    let errorCount = 0
    const errors: Array<{ user: any, error: string }> = []

    for (const user of pendingUsers) {
      try {
        if (this.options.verbose) {
          console.log(`Processing user: ${user.email}`)
        }

        // For now, we'll just prepare the user for migration
        // The actual linking will happen via Clerk webhooks when users sign in
        await this.prepareUserForMigration(user)
        
        successCount++
        
        if (this.options.verbose) {
          console.log(`✅ Prepared user ${user.email} for migration`)
        }
      } catch (error) {
        errorCount++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push({ user, error: errorMessage })
        
        console.error(`❌ Failed to prepare user ${user.email}: ${errorMessage}`)
      }
    }

    console.log('\n📊 Migration Results:')
    console.log(`✅ Successfully prepared: ${successCount}`)
    console.log(`❌ Errors: ${errorCount}`)

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:')
      errors.forEach(({ user, error }) => {
        console.log(`  - ${user.email}: ${error}`)
      })
    }

    console.log('\n📝 Next Steps:')
    console.log('1. Users need to sign up/sign in with Clerk using their existing email')
    console.log('2. The webhook will automatically link their accounts')
    console.log('3. Run the cleanup script to remove password fields')
  }

  private async prepareUserForMigration(user: any) {
    // Add migration metadata to track preparation
    await prisma.user.update({
      where: { id: user.id },
      data: {
        migrationId: `prep_${Date.now()}_${user.id}`,
        // Keep existing data intact for now
      }
    })
  }

  private async confirmMigration(): Promise<boolean> {
    // In a real implementation, you might want to add interactive confirmation
    // For now, we'll assume confirmation
    console.log('⚠️  This will modify user data in the database.')
    console.log('Make sure you have a backup before proceeding.')
    
    // You could add readline here for interactive confirmation
    return true
  }

  async cleanup() {
    console.log('🧹 Starting cleanup process...')
    
    try {
      // Remove password fields from migrated users
      const result = await prisma.user.updateMany({
        where: { 
          clerkId: { not: null },
          password: { not: null }
        },
        data: {
          password: null
        }
      })

      console.log(`✅ Cleaned up password fields for ${result.count} users`)

      // Clean up old migration records (optional)
      const oldMigrations = await prisma.userMigration.deleteMany({
        where: {
          migrationStatus: 'completed',
          completedAt: {
            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
          }
        }
      })

      console.log(`✅ Cleaned up ${oldMigrations.count} old migration records`)

    } catch (error) {
      console.error('❌ Cleanup failed:', error)
      throw error
    }
  }

  async rollback(userId?: string) {
    console.log('🔄 Starting rollback process...')
    
    try {
      if (userId) {
        // Rollback specific user
        const result = await migrationService.rollbackMigration(userId)
        console.log(`Rollback result for user ${userId}:`, result)
      } else {
        // Rollback all users (dangerous!)
        console.log('⚠️  Rolling back ALL users - this is irreversible!')
        
        const result = await prisma.user.updateMany({
          where: { clerkId: { not: null } },
          data: {
            clerkId: null,
            migratedAt: null,
            migrationId: null
          }
        })

        console.log(`✅ Rolled back ${result.count} users`)
      }
    } catch (error) {
      console.error('❌ Rollback failed:', error)
      throw error
    }
  }

  async status() {
    console.log('📊 Migration Status Report')
    console.log('=' .repeat(50))
    
    const stats = await this.getMigrationStats()
    
    console.log(`Total Users: ${stats.totalUsers}`)
    console.log(`Migrated: ${stats.migratedUsers} (${((stats.migratedUsers / stats.totalUsers) * 100).toFixed(1)}%)`)
    console.log(`Pending: ${stats.pendingUsers}`)
    console.log(`With Passwords: ${stats.usersWithPasswords}`)
    
    // Recent migrations
    const recentMigrations = await prisma.userMigration.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    if (recentMigrations.length > 0) {
      console.log('\n📅 Recent Migrations (Last 24h):')
      recentMigrations.forEach(migration => {
        console.log(`  - ${migration.email} (${migration.migrationStatus}) - ${migration.createdAt.toISOString()}`)
      })
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2)
  const options: Partial<MigrationOptions> = {}
  let command = 'migrate'

  // Parse command line arguments
  for (const arg of args) {
    if (arg === '--dry-run') {
      options.dryRun = true
    } else if (arg.startsWith('--batch-size=')) {
      options.batchSize = parseInt(arg.split('=')[1])
    } else if (arg === '--verbose') {
      options.verbose = true
    } else if (arg === '--quiet') {
      options.verbose = false
    } else if (['cleanup', 'rollback', 'status'].includes(arg)) {
      command = arg
    }
  }

  const script = new UserMigrationScript(options)

  switch (command) {
    case 'migrate':
      await script.run()
      break
    case 'cleanup':
      await script.cleanup()
      break
    case 'rollback':
      await script.rollback()
      break
    case 'status':
      await script.status()
      break
    default:
      console.log('Usage: npm run migrate-users [migrate|cleanup|rollback|status] [options]')
      console.log('Options:')
      console.log('  --dry-run       Simulate migration without making changes')
      console.log('  --batch-size=N  Process N users at a time (default: 100)')
      console.log('  --verbose       Show detailed output')
      console.log('  --quiet         Minimize output')
  }
}

if (require.main === module) {
  main().catch(console.error)
}

export { UserMigrationScript }